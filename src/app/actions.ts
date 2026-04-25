"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { start } from "workflow/api";
import { resumeHook } from "workflow/api";
import { db, cases, scripts, clinics } from "@/db";
import { generateContentPipeline } from "@/workflows/pipeline";
import { TEMPLATES } from "@/lib/templates";

const procedureValues = [
  "nose",
  "eyes",
  "face_contour",
  "lifting",
  "breast",
  "body",
  "skin",
  "other",
] as const;

const caseSchema = z.object({
  clinicId: z.string().uuid(),
  caseNumber: z.string().min(1).max(64),
  patientAlias: z.string().min(1).max(64),
  procedure: z.enum(procedureValues),
  procedureSummary: z.string().min(10).max(2000),
  patientStory: z.string().max(4000).optional(),
  templateId: z.string().refine((id) => TEMPLATES.some((t) => t.id === id), {
    message: "Unknown template",
  }),
});

async function uploadToBlob(file: File, prefix: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const blob = await put(`${prefix}/${Date.now()}-${file.name}`, file, {
    access: "public",
    contentType: file.type,
  });
  return blob.url;
}

export async function createCase(formData: FormData) {
  const parsed = caseSchema.parse({
    clinicId: formData.get("clinicId"),
    caseNumber: formData.get("caseNumber"),
    patientAlias: formData.get("patientAlias"),
    procedure: formData.get("procedure"),
    procedureSummary: formData.get("procedureSummary"),
    patientStory: formData.get("patientStory") || undefined,
    templateId: formData.get("templateId"),
  });

  const consentForm = formData.get("consentForm") as File | null;
  if (!consentForm || consentForm.size === 0) {
    throw new Error("환자 동의서 업로드 필수");
  }

  const beforeFiles = formData.getAll("beforeImages") as File[];
  const afterFiles = formData.getAll("afterImages") as File[];

  const consentUrl = await uploadToBlob(consentForm, "consents");
  const beforeUrls = (
    await Promise.all(beforeFiles.map((f) => uploadToBlob(f, "before")))
  ).filter((u): u is string => u !== null);
  const afterUrls = (
    await Promise.all(afterFiles.map((f) => uploadToBlob(f, "after")))
  ).filter((u): u is string => u !== null);

  const [created] = await db
    .insert(cases)
    .values({
      clinicId: parsed.clinicId,
      caseNumber: parsed.caseNumber,
      patientAlias: parsed.patientAlias,
      procedure: parsed.procedure,
      procedureSummary: parsed.procedureSummary,
      patientStory: parsed.patientStory,
      consentFormUrl: consentUrl!,
      beforeImageUrls: beforeUrls,
      afterImageUrls: afterUrls,
      status: "draft",
    })
    .returning();

  const run = await start(generateContentPipeline, [
    created.id,
    parsed.templateId,
  ]);

  await db
    .update(cases)
    .set({ workflowRunId: run.runId, status: "script_pending" })
    .where(eq(cases.id, created.id));

  revalidatePath("/cases");
  redirect(`/cases/${created.id}`);
}

const approvalSchema = z.object({
  token: z.string().min(8).max(128),
  approved: z.enum(["true", "false"]),
  rejectionReason: z.string().max(2000).optional(),
  revisedScript: z.string().max(8000).optional(),
});

export async function submitApproval(formData: FormData) {
  const parsed = approvalSchema.parse({
    token: formData.get("token"),
    approved: formData.get("approved"),
    rejectionReason: formData.get("rejectionReason") || undefined,
    revisedScript: formData.get("revisedScript") || undefined,
  });

  const script = await db.query.scripts.findFirst({
    where: eq(scripts.approvalToken, parsed.token),
  });
  if (!script) throw new Error("Invalid approval token");
  if (script.approved) throw new Error("이미 처리된 승인 요청");

  await resumeHook(`approval:${parsed.token}`, {
    approved: parsed.approved === "true",
    rejectionReason: parsed.rejectionReason,
    revisedScript: parsed.revisedScript,
  });

  revalidatePath(`/approve/${parsed.token}`);
  redirect(`/approve/${parsed.token}/done`);
}

export async function getClinics() {
  return db.select().from(clinics);
}
