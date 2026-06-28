import { describe, it, expect } from 'vitest'
import { classifyDelta, summarizeComparison, sortRunsForComparison } from '../../../src/dashboard/compare'

describe('sortRunsForComparison', () => {
  const older = { id: 'a', createdAt: new Date('2026-01-01') }
  const newer = { id: 'b', createdAt: new Date('2026-06-01') }

  it('puts the older run first regardless of check order', () => {
    const result = sortRunsForComparison([older, newer], new Set(['b', 'a']))
    expect(result![0].id).toBe('a')
    expect(result![1].id).toBe('b')
  })

  it('returns null when fewer than 2 runs are selected', () => {
    expect(sortRunsForComparison([older, newer], new Set(['a']))).toBeNull()
  })

  it('handles null createdAt by treating it as epoch', () => {
    const nullDate = { id: 'c', createdAt: null }
    const result = sortRunsForComparison([newer, nullDate], new Set(['b', 'c']))
    expect(result![0].id).toBe('c')
    expect(result![1].id).toBe('b')
  })
})

describe('classifyDelta', () => {
  it('returns improved when delta is positive', () => {
    expect(classifyDelta(1)).toBe('improved')
    expect(classifyDelta(0.5)).toBe('improved')
  })

  it('returns regressed when delta is negative', () => {
    expect(classifyDelta(-1)).toBe('regressed')
    expect(classifyDelta(-0.1)).toBe('regressed')
  })

  it('returns unchanged when delta is zero', () => {
    expect(classifyDelta(0)).toBe('unchanged')
  })
})

describe('summarizeComparison', () => {
  const makeResult = (grounding: number, persona: number, retrieval: number) => ({
    groundingScore: grounding,
    personaScore: persona,
    retrievalScore: retrieval,
  })

  it('counts improvements, regressions, and unchanged correctly', () => {
    const runA = [makeResult(3, 3, 0.8), makeResult(4, 4, 1.0)]
    const runB = [makeResult(4, 3, 0.8), makeResult(3, 4, 1.0)]

    const summary = summarizeComparison(runA, runB)

    expect(summary.improved).toBe(1)
    expect(summary.regressed).toBe(1)
    expect(summary.unchanged).toBe(0)
  })

  it('counts a question as improved if any dimension improved and none regressed', () => {
    const runA = [makeResult(3, 3, 1.0)]
    const runB = [makeResult(4, 3, 1.0)]

    const summary = summarizeComparison(runA, runB)
    expect(summary.improved).toBe(1)
  })

  it('counts a question as regressed if any dimension regressed', () => {
    const runA = [makeResult(5, 5, 1.0)]
    const runB = [makeResult(5, 3, 1.0)]

    const summary = summarizeComparison(runA, runB)
    expect(summary.regressed).toBe(1)
  })

  it('counts unchanged when all dimensions are the same', () => {
    const runA = [makeResult(4, 4, 1.0)]
    const runB = [makeResult(4, 4, 1.0)]

    const summary = summarizeComparison(runA, runB)
    expect(summary.unchanged).toBe(1)
    expect(summary.improved).toBe(0)
    expect(summary.regressed).toBe(0)
  })
})
