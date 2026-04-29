const apiKey = process.env.HEYGEN_API_KEY;
if (!apiKey) {
  console.error("HEYGEN_API_KEY is not set");
  process.exit(1);
}

async function main() {
  const res = await fetch("https://api.heygen.com/v2/avatars", {
    headers: { "X-Api-Key": apiKey! },
  });

  if (!res.ok) {
    console.error(`❌ HeyGen API failed: ${res.status} ${res.statusText}`);
    console.error(await res.text());
    process.exit(1);
  }

  const json = (await res.json()) as {
    data: {
      avatars: Array<{ avatar_id: string; avatar_name: string; gender?: string }>;
      talking_photos: Array<{ talking_photo_id: string; talking_photo_name: string }>;
    };
  };

  console.log(`✅ HeyGen API key valid`);
  console.log(`\nStock avatars: ${json.data.avatars.length}`);
  console.log(`Talking photos: ${json.data.talking_photos.length}`);

  const custom = json.data.avatars.filter((a) => !a.avatar_id.startsWith("Daisy") && !a.avatar_id.includes("_public"));
  if (custom.length > 0) {
    console.log(`\nLooks-like-custom avatars (top 10):`);
    for (const a of custom.slice(0, 10)) {
      console.log(`  ${a.avatar_id}  —  ${a.avatar_name}${a.gender ? ` (${a.gender})` : ""}`);
    }
  } else {
    console.log(`\n(no custom avatars yet — Studio에서 학습 후 avatar_id 발급 필요)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
