import { db } from '@/src/db/client'
import { evalRuns, evalResults } from '@/src/db/schema'
import { sql, desc, eq } from 'drizzle-orm'
import Link from 'next/link'

async function getRuns() {
  return db
    .select({
      id: evalRuns.id,
      runLabel: evalRuns.runLabel,
      createdAt: evalRuns.createdAt,
      model: evalRuns.model,
      puppy: sql<string>`MAX(${evalResults.puppy})`,
      avgRetrieval: sql<number>`AVG(${evalResults.retrievalScore})`,
      avgGrounding: sql<number>`AVG(${evalResults.groundingScore})`,
      avgPersona: sql<number>`AVG(${evalResults.personaScore})`,
      questionCount: sql<number>`COUNT(${evalResults.id})`,
    })
    .from(evalRuns)
    .leftJoin(evalResults, eq(evalResults.runId, evalRuns.id))
    .groupBy(evalRuns.id)
    .orderBy(desc(evalRuns.createdAt))
}

function fmt(n: number | null, decimals = 2) {
  if (n == null) return '—'
  return Number(n).toFixed(decimals)
}

export default async function RunsPage() {
  const runs = await getRuns()

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Eval Runs</h1>
      {runs.length === 0 ? (
        <p className="text-zinc-500">No runs yet. Run <code>npm run evals -- run --label &quot;baseline&quot;</code> to get started.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="pb-2 pr-4 font-medium">Label</th>
              <th className="pb-2 pr-4 font-medium">Puppy</th>
              <th className="pb-2 pr-4 font-medium">Date</th>
              <th className="pb-2 pr-4 font-medium">Retrieval</th>
              <th className="pb-2 pr-4 font-medium">Grounding</th>
              <th className="pb-2 pr-4 font-medium">Persona</th>
              <th className="pb-2 pr-4 font-medium">Questions</th>
              <th className="pb-2 font-medium">Model</th>
            </tr>
          </thead>
          <tbody>
            {runs.map(run => (
              <tr key={run.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                <td className="py-3 pr-4">
                  <Link href={`/runs/${run.id}`} className="text-blue-600 hover:underline font-medium">
                    {run.runLabel}
                  </Link>
                </td>
                <td className="py-3 pr-4 capitalize">{run.puppy ?? '—'}</td>
                <td className="py-3 pr-4 text-zinc-500">
                  {run.createdAt ? new Date(run.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="py-3 pr-4">{fmt(run.avgRetrieval * 100, 1)}%</td>
                <td className="py-3 pr-4">{fmt(run.avgGrounding)} / 5</td>
                <td className="py-3 pr-4">{fmt(run.avgPersona)} / 5</td>
                <td className="py-3 pr-4">{run.questionCount}</td>
                <td className="py-3 text-zinc-500">{run.model ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
