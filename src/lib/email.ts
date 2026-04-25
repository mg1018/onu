import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY missing");
  return new Resend(apiKey);
}

export async function sendApprovalEmail(input: {
  approverEmail: string;
  approvalToken: string;
  caseNumber: string;
  hook: string;
  script: string;
}) {
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const approveUrl = `${baseUrl}/approve/${input.approvalToken}`;

  const resend = getResend();
  const from = process.env.RESEND_FROM ?? "Onyoo Pipeline <noreply@onyoo.dev>";

  const escapedScript = input.script
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");

  const escapedHook = input.hook
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 16px;">스크립트 승인 요청 — ${input.caseNumber}</h2>
      <div style="background:#f6f8fa; padding:16px; border-radius:8px; margin-bottom:16px;">
        <strong>후킹 (첫 3초):</strong>
        <p style="margin:8px 0 0;">${escapedHook}</p>
      </div>
      <div style="background:#f6f8fa; padding:16px; border-radius:8px; margin-bottom:24px; white-space: pre-wrap;">
        <strong>전체 대본:</strong>
        <p style="margin:8px 0 0;">${escapedScript}</p>
      </div>
      <a href="${approveUrl}"
         style="display:inline-block; background:#000; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px;">
        검토 및 승인 →
      </a>
      <p style="color:#666; font-size:13px; margin-top:24px;">
        이 링크는 케이스 승인을 위한 1회용 링크입니다. 영상 생성은 승인 후 자동 시작됩니다.
      </p>
    </div>
  `;

  await resend.emails.send({
    from,
    to: input.approverEmail,
    subject: `[온유 파이프라인] 스크립트 승인 요청 — ${input.caseNumber}`,
    html,
  });
}
