const ELEVEN_API = "https://api.elevenlabs.io/v1";

type TTSInput = {
  voiceId: string;
  text: string;
  modelId?: string;
  languageCode?: string;
};

export async function synthesizeSpeech(input: TTSInput): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");

  const res = await fetch(
    `${ELEVEN_API}/text-to-speech/${input.voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: input.text,
        model_id: input.modelId ?? "eleven_multilingual_v2",
        language_code: input.languageCode,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.85,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(
      `ElevenLabs TTS failed: ${res.status} ${await res.text()}`,
    );
  }

  return await res.arrayBuffer();
}

export async function createDubbing(input: {
  sourceUrl: string;
  sourceLanguage: "ko";
  targetLanguage: "en" | "ja" | "zh";
}) {
  const apiKey = process.env.ELEVENLABS_API_KEY!;
  const form = new FormData();
  form.append("source_url", input.sourceUrl);
  form.append("source_lang", input.sourceLanguage);
  form.append("target_lang", input.targetLanguage);
  form.append("num_speakers", "1");
  form.append("watermark", "false");

  const res = await fetch(`${ELEVEN_API}/dubbing`, {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs dubbing failed: ${res.status}`);
  }
  const json = (await res.json()) as {
    dubbing_id: string;
    expected_duration_sec: number;
  };
  return json;
}

export async function getDubbingStatus(dubbingId: string) {
  const apiKey = process.env.ELEVENLABS_API_KEY!;
  const res = await fetch(`${ELEVEN_API}/dubbing/${dubbingId}`, {
    headers: { "xi-api-key": apiKey },
  });
  if (!res.ok) throw new Error(`Dubbing status failed: ${res.status}`);
  return (await res.json()) as {
    dubbing_id: string;
    status: "dubbing" | "dubbed" | "failed";
  };
}

export async function getDubbedMedia(dubbingId: string, lang: string) {
  const apiKey = process.env.ELEVENLABS_API_KEY!;
  const res = await fetch(
    `${ELEVEN_API}/dubbing/${dubbingId}/audio/${lang}`,
    { headers: { "xi-api-key": apiKey } },
  );
  if (!res.ok) throw new Error(`Dubbed media fetch failed: ${res.status}`);
  return await res.arrayBuffer();
}
