import { db } from "@/db";
import { scripts, cases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { submitApproval } from "@/app/actions";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ token: string }> };

export default async function ApprovePage({ params }: Props) {
  const { token } = await params;

  const script = await db.query.scripts.findFirst({
    where: eq(scripts.approvalToken, token),
  });

  if (!script) notFound();

  const caseRow = await db.query.cases.findFirst({
    where: eq(cases.id, script.caseId),
  });

  const alreadyHandled = !!script.approved;

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-semibold">스크립트 승인</h1>
        <p className="mb-8 text-sm text-zinc-500">
          케이스 {caseRow?.caseNumber} · {caseRow?.procedure}
        </p>

        {alreadyHandled && (
          <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-700 dark:bg-amber-950">
            이미 처리된 승인입니다 ({script.approved === "yes" ? "승인" : "반려"}).
          </div>
        )}

        <section className="mb-6 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-2 text-sm font-medium text-zinc-500">
            후킹 (첫 3초)
          </h2>
          <p className="text-base">{script.hook}</p>
        </section>

        <section className="mb-8 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-2 text-sm font-medium text-zinc-500">전체 대본</h2>
          <p className="whitespace-pre-wrap text-base leading-relaxed">
            {script.content}
          </p>
        </section>

        <form action={submitApproval} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <details className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <summary className="cursor-pointer">대본 직접 수정 (선택)</summary>
            <textarea
              name="revisedScript"
              rows={6}
              defaultValue={script.content}
              className="textarea mt-3"
            />
          </details>
          <details className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <summary className="cursor-pointer">반려 사유 (반려 시 필수)</summary>
            <textarea
              name="rejectionReason"
              rows={3}
              className="textarea mt-3"
              placeholder="수정 요청 사항"
            />
          </details>

          <div className="flex gap-3">
            <button
              type="submit"
              name="approved"
              value="true"
              disabled={alreadyHandled}
              className="flex-1 rounded-md bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              승인하고 영상 생성
            </button>
            <button
              type="submit"
              name="approved"
              value="false"
              disabled={alreadyHandled}
              className="flex-1 rounded-md border border-zinc-300 px-4 py-3 font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              반려
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
