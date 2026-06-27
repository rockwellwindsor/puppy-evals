import { describe, it, expect } from 'vitest'
import { scoreColor, isFailure } from '../../../src/dashboard/utils'

describe('scoreColor', () => {
  it('returns green for scores at or above 80% of max', () => {
    expect(scoreColor(4, 5)).toBe('text-green-600')
    expect(scoreColor(5, 5)).toBe('text-green-600')
    expect(scoreColor(0.8, 1)).toBe('text-green-600')
  })

  it('returns yellow for scores between 60% and 80% of max', () => {
    expect(scoreColor(3, 5)).toBe('text-yellow-600')
    expect(scoreColor(0.6, 1)).toBe('text-yellow-600')
  })

  it('returns red for scores below 60% of max', () => {
    expect(scoreColor(2, 5)).toBe('text-red-600')
    expect(scoreColor(0, 5)).toBe('text-red-600')
    expect(scoreColor(0.5, 1)).toBe('text-red-600')
  })

  it('returns zinc for null scores', () => {
    expect(scoreColor(null, 5)).toBe('text-zinc-400')
  })
})

describe('isFailure', () => {
  it('returns false when both scores are 3 or above', () => {
    expect(isFailure({ groundingScore: 3, personaScore: 3 })).toBe(false)
    expect(isFailure({ groundingScore: 5, personaScore: 5 })).toBe(false)
  })

  it('returns true when grounding score is below 3', () => {
    expect(isFailure({ groundingScore: 2, personaScore: 5 })).toBe(true)
    expect(isFailure({ groundingScore: 1, personaScore: 4 })).toBe(true)
  })

  it('returns true when persona score is below 3', () => {
    expect(isFailure({ groundingScore: 5, personaScore: 2 })).toBe(true)
  })

  it('returns true when both scores are below 3', () => {
    expect(isFailure({ groundingScore: 1, personaScore: 1 })).toBe(true)
  })

  it('treats null scores as passing (not a failure)', () => {
    expect(isFailure({ groundingScore: null, personaScore: null })).toBe(false)
  })
})
