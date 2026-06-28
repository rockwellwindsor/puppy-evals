import { callEvalEndpoint } from './chatbotClient'
import { scoreRetrieval } from './judges/retrieval'
import { scoreGrounding } from './judges/grounding'
import { scorePersona } from './judges/persona'
import { db } from './db/client'
import { evalRuns, evalResults } from './db/schema'
import { GoldenEntry } from './types/goldenSet'

export interface RunSummary {
  runId: string
  label: string
  puppy: 'gus' | 'mitch'
  totalQuestions: number
  retrieval: number
  grounding: number
  persona: number
}

export async function runEvals(opts: {
  puppy: 'gus' | 'mitch'
  label: string
  goldenSet: GoldenEntry[]
  topK?: number
}): Promise<RunSummary> {
  const { puppy, label, goldenSet, topK } = opts

  const [run] = await db.insert(evalRuns).values({
    runLabel: label,
    model: 'gpt-3.5-turbo',
    topK: topK ?? 5,
  }).returning()

  const scores = { retrieval: 0, grounding: 0, persona: 0 }

  const BATCH_SIZE = 5
  for (let i = 0; i < goldenSet.length; i += BATCH_SIZE) {
    const batch = goldenSet.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (entry) => {
      const response = await callEvalEndpoint(puppy, entry.question, { top_k: topK ?? 5 })

      const actualSections = response.retrieved_chunks.map(c => c.section)

      const [retrieval, grounding, persona] = await Promise.all([
        Promise.resolve(scoreRetrieval(entry.expected_chunk_sections, actualSections)),
        scoreGrounding(entry.question, response.retrieved_chunks, response.answer),
        scorePersona(puppy, entry.question, response.answer),
      ])

      scores.retrieval += retrieval.score
      scores.grounding += grounding.score
      scores.persona += persona.score

      await db.insert(evalResults).values({
        runId: run.id,
        puppy,
        question: entry.question,
        expectedAnswer: entry.example_acceptable_answer,
        expectedChunks: entry.expected_chunk_sections,
        actualAnswer: response.answer,
        retrievedChunks: response.retrieved_chunks,
        retrievalScore: retrieval.score,
        groundingScore: grounding.score,
        groundingReason: grounding.reason,
        personaScore: persona.score,
        personaReason: persona.reason,
        latencyMs: response.latency_ms,
      })
    }))
  }

  const total = goldenSet.length

  return {
    runId: run.id,
    label,
    puppy,
    totalQuestions: total,
    retrieval: scores.retrieval / total,
    grounding: scores.grounding / total,
    persona: scores.persona / total,
  }
}
