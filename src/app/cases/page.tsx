import { db } from "@/db";
import { cases } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function CasesPage() {
  const list = await db
    .select()
    .from(cases)
    .orderBy(desc(cases.createdAt))
    .limit(100)
    .catch(() => []);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="mb-4 inline-block text-sm text-zinc-500 hover:underline">
          ← 홈
        </Link>
        <h1 className="mb-8 text-2xl font-semibold">케이스 목록</h1>
        {list.length === 0 ? (
          <p className="text-zinc-500">아직 케이스가 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="py-2">케이스</th>
                <th>부위</th>
                <th>상태</th>
                <th>생성일</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="py-2">
                    <Link href={`/cases/${c.id}`} className="font-medium hover:underline">
                      {c.caseNumber}
                    </Link>
                  </td>
                  <td>{c.procedure}</td>
                  <td>
                    <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">
                      {c.status}
                    </span>
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
