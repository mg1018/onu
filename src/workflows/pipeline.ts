import { sleep, createHook, FatalError, RetryableError } from "workflow";
import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, cases, scripts, renders, pipelineLogs } from "@/db";
import { TEMPLATES, MEDICAL_AD_RULES } from "@/lib/templates";
import {
  synthesizeSpeech,
  createDubbing,
  getDubbingStatus,
  getDubbedMedia,
} from "@/lib/elevenlabs";
import {
  startHeyGenGeneration,
  pollHeyGenStatus,
} from "@/lib/heygen";
import {
  ensureFolder,
  uploadBufferToDrive,
  uploadFromUrlToDrive,
} from "@/lib/drive";
import { sendApprovalEmail } from "@/lib/email";

type ApprovalPayload = {
  approved: boolean;
  rejectionReason?: string;
  revisedScript?: string;
};

const TARGET_LANGUAGES = ["en", "ja", "zh"] as const;
type TargetLang = (typeof TARGET_LANGUAGES)[number];

const PLATFORM_DIMENSIONS = {
  youtube_shorts: { width: 1080, height: 1920 },
  tiktok: { width: 1080, height: 1920 },
  instagram_reels: { width: 1080, height: 1920 },
  youtube: { width: 1920, height: 1080 },
  instagram_feed: { width: 1080, height: 1080 },
} as const;
type Platform = keyof typeof PLATFORM_DIMENSIONS;

// ---------------- steps ----------------

async function logEvent(
  caseId: string,
  stage: string,
  message: string,
  level: "info" | "warn" | "error" = "info",
  payload?: Record<string, unknown>,
) {
  "use step";
  await db.insert(pipelineLogs).values({
    caseId,
    stage,
    level,
    message,
    payload: payload ?? null,
  });
}

async function setCaseStatus(caseId: string, status: string) {
  "use step";
  await db
    .update(cases)
    .set({ status: status as never, updatedAt: new Date() })
    .where(eq(cases.id, caseId));
}

async function loadCaseData(caseId: string) {
  "use step";
  const row = await db.query.cases.findFirst({
    where: eq(cases.id, caseId),
  });
  if (!row) throw new FatalError(`Case ${caseId} not found`);

  const clinic = await db.query.clinics.findFirst({
    where: (c, { eq }) => eq(c.id, row.clinicId),
  });
  if (!clinic) throw new FatalError(`Clinic ${row.clinicId} not found`);
  if (!clinic.heygenAvatarId || !clinic.elevenlabsVoiceId) {
    throw new FatalError("Clinic avatar or voice not configured");
  }
  if (!clinic.driveFolderId) {
    throw new FatalError("Clinic Drive folder not configured");
  }
  return { caseRow: row, clinic };
}

async function generateScript(input: {
  caseId: string;
  templateId: string;
  caseData: {
    procedure: string;
    procedureSummary: string;
    patientStory: string | null;
    patientAlias: string;
  };
}) {
  "use step";
  const template = TEMPLATES.find((t) => t.id === input.templateId);
  if (!template) throw new FatalError(`Unknown template: ${input.templateId}`);

  const prompt = `${MEDICAL_AD_RULES}

당신은 성형외과 원장 1인칭 시점의 한국어 숏폼 영상 스크립트 작가입니다.
아래 템플릿과 케이스 데이터를 기반으로 ${template.targetDurationSec}초 분량 스크립트를 작성하세요.

[템플릿: ${template.name}]
${template.structure}

[케이스 데이터]
- 시술 부위: ${input.caseData.procedure}
- 시술 요약: ${input.caseData.procedureSummary}
- 환자 가명: ${input.caseData.patientAlias}
- 환자 스토리: ${input.caseData.patientStory ?? "없음"}

출력 JSON 스키마:
{
  "hook": "첫 3초 후킹 문장",
  "script": "원장이 직접 말할 한국어 전체 대본 (자연스러운 구어체)",
  "hashtags": ["#...", "#..."]  // 5-8개
}

JSON만 출력. 설명 금지.`;

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4-5",
    prompt,
    temperature: 0.7,
  });

  const cleaned = text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
  let parsed: { hook: string; script: string; hashtags: string[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new RetryableError("Failed to parse script JSON from LLM");
  }

  const token = nanoid(24);
  const [inserted] = await db
    .insert(scripts)
    .values({
      caseId: input.caseId,
      revision: 1,
      templateId: input.templateId,
      language: "ko",
      content: parsed.script,
      hook: parsed.hook,
      hashtags: parsed.hashtags,
      approvalToken: token,
    })
    .returning();

  return {
    scriptId: inserted.id,
    approvalToken: token,
    hook: parsed.hook,
    content: parsed.script,
    hashtags: parsed.hashtags,
  };
}

async function emailApprovalRequest(input: {
  approverEmail: string;
  approvalToken: string;
  caseNumber: string;
  hook: string;
  script: string;
}) {
  "use step";
  await sendApprovalEmail(input);
}

async function recordApproval(input: {
  scriptId: string;
  caseId: string;
  payload: ApprovalPayload;
}) {
  "use step";
  await db
    .update(scripts)
    .set({
      approved: input.payload.approved ? "yes" : "no",
      approvedAt: new Date(),
      rejectionReason: input.payload.rejectionReason,
    })
    .where(eq(scripts.id, input.scriptId));
}

async function generateVoiceover(input: {
  voiceId: string;
  text: string;
  caseId: string;
}) {
  "use step";
  const audio = await synthesizeSpeech({
    voiceId: input.voiceId,
    text: input.text,
    languageCode: "ko",
  });

  const { put } = await import("@vercel/blob");
  const blob = await put(
    `voiceovers/${input.caseId}-${Date.now()}.mp3`,
    Buffer.from(audio),
    { access: "public", contentType: "audio/mpeg" },
  );
  return blob.url;
}

async function kickoffAvatarRender(input: {
  avatarId: string;
  audioUrl: string;
  title: string;
  platform: Platform;
}) {
  "use step";
  const videoId = await startHeyGenGeneration({
    avatarId: input.avatarId,
    audioUrl: input.audioUrl,
    title: input.title,
    dimensions: PLATFORM_DIMENSIONS[input.platform],
  });
  return videoId;
}

async function waitForHeyGen(videoId: string): Promise<{ url: string; captionUrl?: string }> {
  "use step";
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    const status = await pollHeyGenStatus(videoId);
    if (status.status === "completed" && status.video_url) {
      return { url: status.video_url, captionUrl: status.video_url_caption };
    }
    if (status.status === "failed") {
      throw new FatalError(`HeyGen render failed: ${JSON.stringify(status.error)}`);
    }
    await new Promise((r) => setTimeout(r, 15_000));
  }
  throw new RetryableError("HeyGen render timed out");
}

async function dubToLanguage(input: {
  sourceUrl: string;
  targetLang: TargetLang;
  caseId: string;
}) {
  "use step";
  const langMap = { en: "en", ja: "ja", zh: "zh" } as const;
  const { dubbing_id } = await createDubbing({
    sourceUrl: input.sourceUrl,
    sourceLanguage: "ko",
    targetLanguage: langMap[input.targetLang],
  });

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 15_000));
    const s = await getDubbingStatus(dubbing_id);
    if (s.status === "dubbed") break;
    if (s.status === "failed") throw new FatalError("Dubbing failed");
  }

  const media = await getDubbedMedia(dubbing_id, input.targetLang);
  const { put } = await import("@vercel/blob");
  const blob = await put(
    `dubbed/${input.caseId}-${input.targetLang}-${Date.now()}.mp4`,
    Buffer.from(media),
    { access: "public", contentType: "video/mp4" },
  );
  return blob.url;
}

async function recordRender(input: {
  caseId: string;
  scriptId: string;
  language: string;
  platform: string;
  videoUrl: string;
  captionSrtUrl?: string;
  heygenVideoId?: string;
}) {
  "use step";
  await db.insert(renders).values(input);
}

async function packageToDrive(input: {
  caseId: string;
  caseNumber: string;
  clinicDriveFolderId: string;
  deliverables: Array<{ language: string; platform: string; videoUrl: string; captionUrl?: string }>;
  hashtags: string[];
}) {
  "use step";
  const isoWeek = getIsoWeek(new Date());
  const weekFolder = await ensureFolder(isoWeek, input.clinicDriveFolderId);
  const caseFolder = await ensureFolder(input.caseNumber, weekFolder);

  for (const d of input.deliverables) {
    const langFolder = await ensureFolder(d.language, caseFolder);
    await uploadFromUrlToDrive({
      url: d.videoUrl,
      name: `${d.platform}.mp4`,
      mimeType: "video/mp4",
      parentId: langFolder,
    });
    if (d.captionUrl) {
      await uploadFromUrlToDrive({
        url: d.captionUrl,
        name: `${d.platform}.srt`,
        mimeType: "application/x-subrip",
        parentId: langFolder,
      });
    }
  }

  await uploadBufferToDrive({
    buffer: Buffer.from(input.hashtags.join("\n"), "utf-8"),
    name: "hashtags.txt",
    mimeType: "text/plain",
    parentId: caseFolder,
  });

  return caseFolder;
}

function getIsoWeek(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// ---------------- workflow ----------------

export async function generateContentPipeline(
  caseId: string,
  templateId: string,
  platforms: Platform[] = ["tiktok", "youtube_shorts", "instagram_reels"],
) {
  "use workflow";

  await logEvent(caseId, "start", "Pipeline started");
  const { caseRow, clinic } = await loadCaseData(caseId);

  // Step 2: Script generation
  await setCaseStatus(caseId, "script_pending");
  const script = await generateScript({
    caseId,
    templateId,
    caseData: {
      procedure: caseRow.procedure,
      procedureSummary: caseRow.procedureSummary,
      patientStory: caseRow.patientStory,
      patientAlias: caseRow.patientAlias,
    },
  });
  await logEvent(caseId, "script", "Script generated", "info", {
    scriptId: script.scriptId,
  });

  // Step 3: Approval (suspend on hook)
  await setCaseStatus(caseId, "awaiting_approval");
  await emailApprovalRequest({
    approverEmail: clinic.approverEmail,
    approvalToken: script.approvalToken,
    caseNumber: caseRow.caseNumber,
    hook: script.hook,
    script: script.content,
  });

  const hook = createHook<ApprovalPayload>({
    token: `approval:${script.approvalToken}`,
  });
  const approval = await hook;
  await recordApproval({ scriptId: script.scriptId, caseId, payload: approval });

  if (!approval.approved) {
    await setCaseStatus(caseId, "rejected");
    await logEvent(caseId, "approval", "Rejected", "warn", approval);
    return { status: "rejected", reason: approval.rejectionReason };
  }
  await setCaseStatus(caseId, "approved");

  // Step 4: Voice
  await setCaseStatus(caseId, "generating_voice");
  const finalScript = approval.revisedScript ?? script.content;
  const voiceoverUrl = await generateVoiceover({
    voiceId: clinic.elevenlabsVoiceId!,
    text: finalScript,
    caseId,
  });
  await logEvent(caseId, "voice", "Voiceover ready", "info", { voiceoverUrl });

  // Step 5: Avatar render per platform (Korean)
  await setCaseStatus(caseId, "generating_avatar");
  const koreanRenders: Array<{ platform: Platform; videoId: string }> = [];
  for (const platform of platforms) {
    const videoId = await kickoffAvatarRender({
      avatarId: clinic.heygenAvatarId!,
      audioUrl: voiceoverUrl,
      title: `${caseRow.caseNumber}-${platform}`,
      platform,
    });
    koreanRenders.push({ platform, videoId });
  }

  const deliverables: Array<{
    language: string;
    platform: string;
    videoUrl: string;
    captionUrl?: string;
  }> = [];

  for (const r of koreanRenders) {
    const result = await waitForHeyGen(r.videoId);
    await recordRender({
      caseId,
      scriptId: script.scriptId,
      language: "ko",
      platform: r.platform,
      videoUrl: result.url,
      captionSrtUrl: result.captionUrl,
      heygenVideoId: r.videoId,
    });
    deliverables.push({
      language: "ko",
      platform: r.platform,
      videoUrl: result.url,
      captionUrl: result.captionUrl,
    });
  }

  // Step 6: Multilingual (use 9:16 primary source for dubbing)
  await setCaseStatus(caseId, "translating");
  const primaryKorean = deliverables.find((d) => d.platform === "tiktok")
    ?? deliverables[0];

  for (const lang of TARGET_LANGUAGES) {
    try {
      const dubbedUrl = await dubToLanguage({
        sourceUrl: primaryKorean.videoUrl,
        targetLang: lang,
        caseId,
      });
      for (const platform of platforms) {
        deliverables.push({
          language: lang,
          platform,
          videoUrl: dubbedUrl,
        });
        await recordRender({
          caseId,
          scriptId: script.scriptId,
          language: lang,
          platform,
          videoUrl: dubbedUrl,
        });
      }
    } catch (e) {
      await logEvent(caseId, "dub", `Dub failed for ${lang}`, "error", {
        error: String(e),
      });
    }
  }

  // Step 7: Package + Drive
  await setCaseStatus(caseId, "packaging");
  const driveFolderId = await packageToDrive({
    caseId,
    caseNumber: caseRow.caseNumber,
    clinicDriveFolderId: clinic.driveFolderId!,
    deliverables,
    hashtags: script.hashtags,
  });

  await setCaseStatus(caseId, "delivered");
  await logEvent(caseId, "done", "Delivered to Drive", "info", { driveFolderId });
  await sleep("1s");

  return {
    status: "delivered",
    driveFolderId,
    deliverableCount: deliverables.length,
  };
}
