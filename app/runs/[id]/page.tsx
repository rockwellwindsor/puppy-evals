import { db } from '@/src/db/client'
import { evalRuns, evalResults } from '@/src/db/schema'
import { eq, asc } from 'drizzle-orm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { scoreColor, isFailure } from '@/src/dashboard/utils'

async function getRun(id: string) {
  const [run] = await db.select().from(evalRuns).where(eq(evalRuns.id, id))
  return run ?? null
}

async function getResults(runId: string) {
  return db
    .select()
    .from(evalResults)
    .where(eq(evalResults.runId, runId))
    .orderBy(asc(evalResults.puppy), asc(evalResults.question))
}


export default async function RunDetailPage({ params }: { params: { id: string } }) {
  const run = await getRun(params.id)
  if (!run) notFound()

  const results = await getResults(run.id)

  const avgRetrieval = results.reduce((s, r) => s + (r.retrievalScore ?? 0), 0) / results.length
  const avgGrounding = results.reduce((s, r) => s + (r.groundingScore ?? 0), 0) / results.length
  const avgPersona = results.reduce((s, r) => s + (r.personaScore ?? 0), 0) / results.length

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/runs" className="text-sm text-zinc-500 hover:text-zinc-800">← All runs</Link>
        <h1 className="text-2xl font-semibold mt-2">{run.runLabel}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {run.createdAt ? new Date(run.createdAt).toLocaleString() : ''} · {run.model}
        </p>
      </div>

      <div className="flex gap-8 mb-8 text-sm">
        <div>
          <div className="text-zinc-500">Retrieval</div>
          <div className={`text-xl font-semibold ${scoreColor(avgRetrieval, 1)}`}>
            {(avgRetrieval * 100).toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-zinc-500">Grounding</div>
          <div className={`text-xl font-semibold ${scoreColor(avgGrounding, 5)}`}>
            {avgGrounding.toFixed(2)} / 5
          </div>
        </div>
        <div>
          <div className="text-zinc-500">Persona</div>
          <div className={`text-xl font-semibold ${scoreColor(avgPersona, 5)}`}>
            {avgPersona.toFixed(2)} / 5
          </div>
        </div>
        <div>
          <div className="text-zinc-500">Questions</div>
          <div className="text-xl font-semibold">{results.length}</div>
        </div>
      </div>

      <div className="space-y-2">
        {results.map(result => (
          <details
            key={result.id}
            className={`border rounded-lg ${isFailure(result) ? 'border-red-200 bg-red-50' : 'border-zinc-200 bg-white'}`}
          >
            <summary className="px-4 py-3 cursor-pointer list-none flex items-center justify-between gap-4">
              <span className="text-sm font-medium flex-1 truncate">{result.question}</span>
              <span className="flex gap-4 text-xs shrink-0">
                <span className={scoreColor(result.retrievalScore, 1)}>
                  R {((result.retrievalScore ?? 0) * 100).toFixed(0)}%
                </span>
                <span className={scoreColor(result.groundingScore, 5)}>
                  G {result.groundingScore ?? '—'}/5
                </span>
                <span className={scoreColor(result.personaScore, 5)}>
                  P {result.personaScore ?? '—'}/5
                </span>
                <span className="text-zinc-400">{result.latencyMs}ms</span>
              </span>
            </summary>

            <div className="px-4 pb-4 pt-2 border-t border-zinc-100 space-y-4 text-sm">
              <div>
                <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Answer</div>
                <p className="text-zinc-800">{result.actualAnswer}</p>
              </div>

              {Array.isArray(result.retrievedChunks) && result.retrievedChunks.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Retrieved chunks</div>
                  <div className="space-y-2">
                    {(result.retrievedChunks as Array<{ section: string; content: string }>).map((chunk, i) => (
                      <div key={i} className="bg-zinc-50 rounded p-2">
                        <div className="text-xs font-medium text-zinc-500 mb-1">{chunk.section}</div>
                        <p className="text-xs text-zinc-700">{chunk.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Grounding reason</div>
                  <p className="text-zinc-700">{result.groundingReason ?? '—'}</p>
                </div>
                <div>
                  <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Persona reason</div>
                  <p className="text-zinc-700">{result.personaReason ?? '—'}</p>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </main>
  )
}
