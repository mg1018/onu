const HEYGEN_API = "https://api.heygen.com/v2";

type GenerateInput = {
  avatarId: string;
  audioUrl?: string;
  text?: string;
  voiceId?: string;
  title: string;
  dimensions: { width: number; height: number };
};

export async function startHeyGenGeneration(input: GenerateInput) {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) throw new Error("HEYGEN_API_KEY missing");

  const body = {
    video_inputs: [
      {
        character: {
          type: "avatar",
          avatar_id: input.avatarId,
          avatar_style: "normal",
        },
        voice: input.audioUrl
          ? { type: "audio", audio_url: input.audioUrl }
          : {
              type: "text",
              input_text: input.text,
              voice_id: input.voiceId,
            },
      },
    ],
    title: input.title,
    dimension: input.dimensions,
    test: false,
  };

  const res = await fetch(`${HEYGEN_API}/video/generate`, {
    method: "POST",
    headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`HeyGen generate failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { data: { video_id: string } };
  return json.data.video_id;
}

export async function pollHeyGenStatus(videoId: string) {
  const apiKey = process.env.HEYGEN_API_KEY!;
  const res = await fetch(
    `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
    { headers: { "X-Api-Key": apiKey } },
  );
  if (!res.ok) throw new Error(`HeyGen status failed: ${res.status}`);
  const json = (await res.json()) as {
    data: {
      status: "waiting" | "processing" | "completed" | "failed";
      video_url?: string;
      video_url_caption?: string;
      error?: unknown;
    };
  };
  return json.data;
}

export async function translateHeyGenVideo(
  videoId: string,
  targetLanguage: "English" | "Japanese" | "Chinese (Mandarin, Simplified)",
) {
  const apiKey = process.env.HEYGEN_API_KEY!;
  const res = await fetch(`${HEYGEN_API}/video_translate/translate`, {
    method: "POST",
    headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      video_url: videoId,
      output_language: targetLanguage,
      translate_audio_only: false,
    }),
  });
  if (!res.ok) {
    throw new Error(`HeyGen translate failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { data: { video_translate_id: string } };
  return json.data.video_translate_id;
}
