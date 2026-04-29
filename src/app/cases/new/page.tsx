import { createCase, getClinics } from "@/app/actions";
import { TEMPLATES } from "@/lib/templates";
import Link from "next/link";

export default async function NewCasePage() {
  const clinicList = await getClinics().catch(() => []);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-6 inline-block text-sm text-zinc-500 hover:underline">
          ← 홈으로
        </Link>
        <h1 className="mb-8 text-2xl font-semibold">새 케이스 등록</h1>

        <form action={createCase} className="space-y-6">
          <Field label="클리닉" required>
            <select name="clinicId" required className="select">
              <option value="">선택...</option>
              {clinicList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="케이스 번호" required>
            <input
              name="caseNumber"
              required
              placeholder="예: 2026-W17-001"
              className="input"
            />
          </Field>

          <Field label="환자 가명" required>
            <input
              name="patientAlias"
              required
              placeholder="예: A님"
              className="input"
            />
          </Field>

          <Field label="시술 부위" required>
            <select name="procedure" required className="select">
              <option value="nose">코</option>
              <option value="eyes">눈</option>
              <option value="face_contour">윤곽</option>
              <option value="lifting">리프팅</option>
              <option value="breast">가슴</option>
              <option value="body">바디</option>
              <option value="skin">피부</option>
              <option value="other">기타</option>
            </select>
          </Field>

          <Field label="콘텐츠 템플릿" required>
            <select name="templateId" required className="select">
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.description}
                </option>
              ))}
            </select>
          </Field>

          <Field label="시술 요약" required hint="원장이 영상에서 설명할 핵심 내용">
            <textarea
              name="procedureSummary"
              required
              rows={4}
              className="textarea"
              placeholder="예: 절개 없이 코끝 연골만 재배치하여 1주 회복으로 자연스러운 라인을 만든 케이스"
            />
          </Field>

          <Field label="환자 스토리" hint="고민, 의사 결정 과정, 회복 후기 등">
            <textarea name="patientStory" rows={4} className="textarea" />
          </Field>

          <Field label="환자 동의서 (PDF)" required>
            <input
              type="file"
              name="consentForm"
              accept="application/pdf,image/*"
              required
              className="file"
            />
          </Field>

          <Field label="Before 사진">
            <input
              type="file"
              name="beforeImages"
              multiple
              accept="image/*"
              className="file"
            />
          </Field>

          <Field label="After 사진">
            <input
              type="file"
              name="afterImages"
              multiple
              accept="image/*"
              className="file"
            />
          </Field>

          <button
            type="submit"
            className="w-full rounded-md bg-black px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-700 active:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:active:bg-zinc-300"
          >
            파이프라인 시작
          </button>
          <p className="text-center text-xs text-zinc-500">
            제출 시 자동으로 스크립트가 생성되고 원장님께 승인 이메일이 발송됩니다.
          </p>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {hint && <span className="mb-1 block text-xs text-zinc-500">{hint}</span>}
      {children}
    </label>
  );
}
