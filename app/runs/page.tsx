import { db } from '@/src/db/client'
import { evalRuns, evalResults } from '@/src/db/schema'
import { sql, desc, eq } from 'drizzle-orm'
import RunsTable from './RunsTable'

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

export default async function RunsPage() {
  const runs = await getRuns()

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Eval Runs</h1>
      {runs.length === 0 ? (
        <p className="text-zinc-500">No runs yet. Run <code>npm run evals -- run --label &quot;baseline&quot;</code> to get started.</p>
      ) : (
        <RunsTable runs={runs} />
      )}
    </main>
  )
}
