import { createServer } from "node:http";
import { google } from "googleapis";

const PORT = 42813;
const REDIRECT_URI = `http://localhost:${PORT}/oauth-callback`;
const SCOPE = "https://www.googleapis.com/auth/drive";

async function main() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET 필요");
    console.error("`.env.local`에 박은 뒤 `npm run drive:oauth-init` 실행");
    process.exit(1);
  }

  const oauth = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

  const authUrl = oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [SCOPE],
  });

  const code: string = await new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      if (!req.url?.startsWith("/oauth-callback")) {
        res.writeHead(404).end();
        return;
      }
      const u = new URL(req.url, `http://localhost:${PORT}`);
      const c = u.searchParams.get("code");
      const err = u.searchParams.get("error");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<h2>${c ? "OK — 터미널로 돌아가세요" : `Error: ${err}`}</h2>`);
      server.close();
      if (c) resolve(c);
      else reject(new Error(err ?? "no code"));
    });
    server.listen(PORT, () => {
      console.log("\n브라우저 열어서 다음 URL로 접속 + 승인:");
      console.log(`\n  ${authUrl}\n`);
      console.log(`(callback 받기 위해 :${PORT} listening)`);
    });
  });

  const { tokens } = await oauth.getToken(code);
  if (!tokens.refresh_token) {
    console.error("refresh_token이 발급되지 않았습니다 (이미 승인된 적이 있을 수 있음).");
    console.error("https://myaccount.google.com/permissions 에서 앱 액세스 제거 후 재시도");
    process.exit(1);
  }

  console.log("\n=== 발급 완료 ===");
  console.log(`refresh_token: ${tokens.refresh_token}`);
  console.log("\n.env.local 에 다음 줄 추가:");
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log("\n그리고 동일한 값으로 Vercel env에도 등록:");
  console.log(`  vercel env add GOOGLE_OAUTH_REFRESH_TOKEN production`);
  console.log(`  vercel env add GOOGLE_OAUTH_REFRESH_TOKEN preview`);
  console.log(`  vercel env add GOOGLE_OAUTH_REFRESH_TOKEN development`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
