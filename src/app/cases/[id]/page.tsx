import { db } from "@/db";
import { cases, scripts, renders, pipelineLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params;

  const caseRow = await db.query.cases.findFirst({
    where: eq(cases.id, id),
  });
  if (!caseRow) notFound();

  const scriptList = await db
    .select()
    .from(scripts)
    .where(eq(scripts.caseId, id))
    .orderBy(desc(scripts.createdAt));

  const renderList = await db
    .select()
    .from(renders)
    .where(eq(renders.caseId, id))
    .orderBy(desc(renders.createdAt));

  const logList = await db
    .select()
    .from(pipelineLogs)
    .where(eq(pipelineLogs.caseId, id))
    .orderBy(desc(pipelineLogs.createdAt))
    .limit(50);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-zinc-500 hover:underline"
        >
          ← 홈
        </Link>
        <header className="mb-8">
          <h1 className="text-2xl font-semibold">{caseRow.caseNumber}</h1>
          <div className="mt-2 flex gap-2">
            <Badge>{caseRow.procedure}</Badge>
            <Badge>{caseRow.status}</Badge>
          </div>
        </header>

        <Section title="시술 요약">
          <p className="text-sm whitespace-pre-wrap">{caseRow.procedureSummary}</p>
        </Section>

        {caseRow.patientStory && (
          <Section title="환자 스토리">
            <p className="text-sm whitespace-pre-wrap">{caseRow.patientStory}</p>
          </Section>
        )}

        <Section title="스크립트">
          {scriptList.length === 0 ? (
            <Empty>아직 스크립트가 없습니다</Empty>
          ) : (
            <ul className="space-y-3">
              {scriptList.map((s) => (
                <li
                  key={s.id}
                  className="rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-2 flex justify-between text-xs text-zinc-500">
                    <span>rev {s.revision} · {s.language}</span>
                    <span>
                      {s.approved === "yes"
                        ? "✅ 승인"
                        : s.approved === "no"
                          ? "❌ 반려"
                          : "⏳ 대기"}
                    </span>
                  </div>
                  <p className="font-medium">{s.hook}</p>
                  <p className="mt-2 whitespace-pre-wrap">{s.content}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="렌더 결과">
          {renderList.length === 0 ? (
            <Empty>아직 렌더링 결과가 없습니다</Empty>
          ) : (
            <ul className="space-y-2 text-sm">
              {renderList.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span>
                    [{r.language}] {r.platform}
                  </span>
                  {r.videoUrl && (
                    <a
                      href={r.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      재생
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="파이프라인 로그">
          {logList.length === 0 ? (
            <Empty>로그 없음</Empty>
          ) : (
            <ul className="space-y-1 text-xs font-mono">
              {logList.map((l) => (
                <li key={l.id} className="flex gap-3">
                  <span className="text-zinc-400">
                    {new Date(l.createdAt).toLocaleTimeString()}
                  </span>
                  <span className="text-zinc-500">[{l.stage}]</span>
                  <span
                    className={
                      l.level === "error"
                        ? "text-red-600"
                        : l.level === "warn"
                          ? "text-amber-600"
                          : ""
                    }
                  >
                    {l.message}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-medium text-zinc-500">{title}</h2>
      {children}
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">
      {children}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}
