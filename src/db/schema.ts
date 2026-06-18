import { pgTable, uuid, text, integer, real, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const evalRuns = pgTable('eval_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  runLabel: text('run_label').notNull(),
  promptVersion: text('prompt_version'),
  model: text('model'),
  topK: integer('top_k'),
  goldenSetVersion: text('golden_set_version'),
  aggregateScores: jsonb('aggregate_scores'),
})

export const evalResults = pgTable('eval_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  runId: uuid('run_id').notNull().references(() => evalRuns.id, { onDelete: 'cascade' }),
  puppy: text('puppy').notNull(),
  question: text('question').notNull(),
  expectedAnswer: text('expected_answer'),
  expectedChunks: jsonb('expected_chunks'),
  actualAnswer: text('actual_answer'),
  retrievedChunks: jsonb('retrieved_chunks'),
  retrievalScore: real('retrieval_score'),
  groundingScore: integer('grounding_score'),
  groundingReason: text('grounding_reason'),
  personaScore: integer('persona_score'),
  personaReason: text('persona_reason'),
  latencyMs: integer('latency_ms'),
  costUsd: real('cost_usd'),
})
