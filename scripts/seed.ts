import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const db = drizzle({ client: neon(url), schema });

const SEED = {
  name: process.env.SEED_CLINIC_NAME ?? "온유성형외과",
  approverEmail: process.env.SEED_APPROVER_EMAIL ?? "mg1018@whatap.io",
  heygenAvatarId: process.env.SEED_HEYGEN_AVATAR_ID ?? null,
  elevenlabsVoiceId: process.env.SEED_ELEVENLABS_VOICE_ID ?? null,
  driveFolderId: process.env.SEED_DRIVE_FOLDER_ID ?? null,
};

async function main() {
  const existing = await db
    .select()
    .from(schema.clinics)
    .where(eq(schema.clinics.name, SEED.name))
    .limit(1);

  if (existing.length > 0) {
    const updated = await db
      .update(schema.clinics)
      .set(SEED)
      .where(eq(schema.clinics.id, existing[0].id))
      .returning();
    console.log("✅ Updated clinic:", updated[0]);
  } else {
    const created = await db.insert(schema.clinics).values(SEED).returning();
    console.log("✅ Created clinic:", created[0]);
  }

  console.log("\n다음 단계:");
  console.log("1. HeyGen Studio Avatar 학습 후 avatar_id를 SEED_HEYGEN_AVATAR_ID로 등록");
  console.log("2. ElevenLabs voice clone 후 voice_id를 SEED_ELEVENLABS_VOICE_ID로 등록");
  console.log("3. Google Drive 폴더 생성 후 folder_id를 SEED_DRIVE_FOLDER_ID로 등록");
  console.log("4. 다시 npm run db:seed 실행해서 업데이트");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });
