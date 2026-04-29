import Link from "next/link";
import { db } from "@/db";
import { cases } from "@/db/schema";
import { desc } from "drizzle-orm";
import { statusBadgeClass, statusLabel } from "@/lib/status";

export default async function Home() {
  let recent: Awaited<ReturnType<typeof db.select.prototype.execute>> = [];
  try {
    recent = await db
      .select()
      .from(cases)
      .orderBy(desc(cases.createdAt))
      .limit(10);
  } catch {
    recent = [];
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight">
            온유 AI 콘텐츠 파이프라인
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            케이스 입력 → 스크립트 생성 → 원장 승인 → AI 영상 자동 제작
          </p>
        </header>

        <div className="mb-8 flex gap-3">
          <Link
            href="/cases/new"
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            + 새 케이스 시작
          </Link>
          <Link
            href="/cases"
            className="rounded-md border border-zinc-300 px-4 py-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            케이스 목록
          </Link>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-medium">최근 케이스</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-zinc-500">
              아직 등록된 케이스가 없습니다.
            </p>
          ) : (
            <ul className="space-y-2">
              {(recent as Array<{ id: string; caseNumber: string; status: string; createdAt: Date }>).map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <Link href={`/cases/${c.id}`} className="font-medium hover:underline">
                    {c.caseNumber}
                  </Link>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusBadgeClass(c.status)}`}
                  >
                    {statusLabel(c.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
