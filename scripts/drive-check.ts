import { google } from "googleapis";
import { Readable } from "node:stream";

const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const folderId = process.env.SEED_DRIVE_FOLDER_ID;

if (!json) {
  console.error("❌ GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  process.exit(1);
}
if (!folderId) {
  console.error("❌ SEED_DRIVE_FOLDER_ID is not set");
  process.exit(1);
}

let credentials: { client_email: string; private_key: string };
try {
  credentials = JSON.parse(json) as { client_email: string; private_key: string };
} catch (e) {
  console.error("❌ Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", e);
  process.exit(1);
}

console.log(`Service account: ${credentials.client_email}`);
console.log(`Target folder ID: ${folderId}\n`);

const auth = new google.auth.JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

async function main() {
  // 1. Verify folder access
  console.log("[1/4] Reading folder metadata...");
  const folder = await drive.files.get({
    fileId: folderId!,
    fields: "id, name, mimeType, owners",
    supportsAllDrives: true,
  });
  console.log(`  ✅ Folder: "${folder.data.name}" (${folder.data.mimeType})`);

  // 2. Upload test file
  console.log("\n[2/4] Uploading test file...");
  const testContent = `Onyoo Drive integration test — ${new Date().toISOString()}`;
  const uploaded = await drive.files.create({
    requestBody: {
      name: `drive-check-${Date.now()}.txt`,
      parents: [folderId!],
    },
    media: {
      mimeType: "text/plain",
      body: Readable.from(Buffer.from(testContent)),
    },
    fields: "id, name, webViewLink",
    supportsAllDrives: true,
  });
  console.log(`  ✅ Uploaded: ${uploaded.data.name}`);
  console.log(`  ID: ${uploaded.data.id}`);
  console.log(`  Link: ${uploaded.data.webViewLink}`);

  // 3. List files in folder
  console.log("\n[3/4] Listing files in folder...");
  const list = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id, name, mimeType, createdTime)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 10,
  });
  const files = list.data.files ?? [];
  console.log(`  ✅ Found ${files.length} file(s):`);
  for (const f of files.slice(0, 10)) {
    console.log(`    - ${f.name} (${f.mimeType})`);
  }

  // 4. Cleanup
  console.log("\n[4/4] Cleaning up test file...");
  await drive.files.delete({
    fileId: uploaded.data.id!,
    supportsAllDrives: true,
  });
  console.log(`  ✅ Deleted test file`);

  console.log("\n🎉 Drive integration verified — service account, folder, upload all working.");
}

main().catch((e) => {
  console.error("\n❌ Drive check failed:", e?.message ?? e);
  if (e?.errors) console.error(e.errors);
  process.exit(1);
});
