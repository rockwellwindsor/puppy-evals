import { describe, it, expect, afterEach } from 'vitest'
import { eq } from 'drizzle-orm'
import { db } from '../../src/db/client'
import { evalRuns } from '../../src/db/schema'

describe('eval_runs', () => {
  const insertedIds: string[] = []

  afterEach(async () => {
    for (const id of insertedIds) {
      await db.delete(evalRuns).where(eq(evalRuns.id, id))
    }
    insertedIds.length = 0
  })

  it('inserts and retrieves an eval run', async () => {
    const [inserted] = await db.insert(evalRuns).values({
      runLabel: 'test-run',
      model: 'gpt-3.5-turbo',
      topK: 3,
    }).returning()

    insertedIds.push(inserted.id)

    const [retrieved] = await db.select().from(evalRuns).where(eq(evalRuns.id, inserted.id))

    expect(retrieved.runLabel).toBe('test-run')
    expect(retrieved.model).toBe('gpt-3.5-turbo')
    expect(retrieved.topK).toBe(3)
    expect(retrieved.id).toBeDefined()
    expect(retrieved.createdAt).toBeInstanceOf(Date)
  })
})
