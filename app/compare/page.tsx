import { db } from '@/src/db/client'
import { evalRuns, evalResults } from '@/src/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { classifyDelta, summarizeComparison } from '@/src/dashboard/compare'

async function getRunWithResults(id: string) {
  const [run] = await db.select().from(evalRuns).where(eq(evalRuns.id, id))
  if (!run) return null
  const results = await db.select().from(evalResults).where(eq(evalResults.runId, id))
  return { run, results }
}

function deltaLabel(delta: number) {
  if (delta === 0) return '—'
  return delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)
}

function deltaClass(delta: number) {
  if (delta > 0) return 'text-green-600 font-medium'
  if (delta < 0) return 'text-red-600 font-medium'
  return 'text-zinc-400'
}

function rowBg(groundingDelta: number, personaDelta: number, retrievalDelta: number) {
  const anyRegressed = groundingDelta < 0 || personaDelta < 0 || retrievalDelta < 0
  const anyImproved = groundingDelta > 0 || personaDelta > 0 || retrievalDelta > 0
  if (anyRegressed) return 'bg-red-50 border-red-200'
  if (anyImproved) return 'bg-green-50 border-green-200'
  return 'bg-white border-zinc-200'
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ a?: string; b?: string }> }) {
  const { a, b } = await searchParams

  if (!a || !b) {
    return (
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Compare Runs</h1>
        <p className="text-zinc-500">Provide two run IDs as query params: <code>?a=&lt;run-id&gt;&amp;b=&lt;run-id&gt;</code></p>
        <Link href="/runs" className="text-blue-600 hover:underline text-sm mt-4 inline-block">← All runs</Link>
      </main>
    )
  }

  const [dataA, dataB] = await Promise.all([getRunWithResults(a), getRunWithResults(b)])

  if (!dataA || !dataB) {
    return (
      <main className="p-8 max-w-6xl mx-auto">
        <p className="text-red-600">One or both run IDs not found.</p>
        <Link href="/runs" className="text-blue-600 hover:underline text-sm mt-4 inline-block">← All runs</Link>
      </main>
    )
  }

  const byQuestion = new Map(dataA.results.map(r => [r.question, r]))

  const pairs = dataB.results
    .map(rB => ({ rA: byQuestion.get(rB.question), rB }))
    .filter((p): p is { rA: NonNullable<typeof p.rA>; rB: typeof p.rB } => p.rA != null)

  const summary = summarizeComparison(
    pairs.map(p => ({ groundingScore: p.rA.groundingScore ?? 0, personaScore: p.rA.personaScore ?? 0, retrievalScore: p.rA.retrievalScore ?? 0 })),
    pairs.map(p => ({ groundingScore: p.rB.groundingScore ?? 0, personaScore: p.rB.personaScore ?? 0, retrievalScore: p.rB.retrievalScore ?? 0 }))
  )

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/runs" className="text-sm text-zinc-500 hover:text-zinc-800">← All runs</Link>
        <h1 className="text-2xl font-semibold mt-2">Comparing runs</h1>
        <div className="text-sm text-zinc-500 mt-1 flex gap-4">
          <span><span className="font-medium text-zinc-800">A:</span> {dataA.run.runLabel}</span>
          <span><span className="font-medium text-zinc-800">B:</span> {dataB.run.runLabel}</span>
        </div>
      </div>

      <div className="flex gap-6 mb-8 text-sm">
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <div className="text-green-700 font-semibold text-xl">{summary.improved}</div>
          <div className="text-green-600">improved</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <div className="text-red-700 font-semibold text-xl">{summary.regressed}</div>
          <div className="text-red-600">regressed</div>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
          <div className="text-zinc-700 font-semibold text-xl">{summary.unchanged}</div>
          <div className="text-zinc-500">unchanged</div>
        </div>
      </div>

      <div className="space-y-2">
        {pairs.map(({ rA, rB }) => {
          const gDelta = (rB.groundingScore ?? 0) - (rA.groundingScore ?? 0)
          const pDelta = (rB.personaScore ?? 0) - (rA.personaScore ?? 0)
          const rDelta = (rB.retrievalScore ?? 0) - (rA.retrievalScore ?? 0)

          return (
            <div key={rB.id} className={`border rounded-lg px-4 py-3 ${rowBg(gDelta, pDelta, rDelta)}`}>
              <div className="text-sm font-medium mb-2 truncate">{rB.question}</div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-zinc-500 mb-1">Grounding</div>
                  <div className="flex gap-2 items-baseline">
                    <span className="text-zinc-500">{rA.groundingScore}/5 → {rB.groundingScore}/5</span>
                    <span className={deltaClass(gDelta)}>{deltaLabel(gDelta)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 mb-1">Persona</div>
                  <div className="flex gap-2 items-baseline">
                    <span className="text-zinc-500">{rA.personaScore}/5 → {rB.personaScore}/5</span>
                    <span className={deltaClass(pDelta)}>{deltaLabel(pDelta)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 mb-1">Retrieval</div>
                  <div className="flex gap-2 items-baseline">
                    <span className="text-zinc-500">{((rA.retrievalScore ?? 0) * 100).toFixed(0)}% → {((rB.retrievalScore ?? 0) * 100).toFixed(0)}%</span>
                    <span className={deltaClass(rDelta)}>{deltaLabel(rDelta * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
