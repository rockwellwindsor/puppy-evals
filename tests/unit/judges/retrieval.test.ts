import { describe, it, expect } from 'vitest'
import { scoreRetrieval } from '../../../src/judges/retrieval'

describe('scoreRetrieval', () => {
  it('returns 1.0 when all expected sections were retrieved', () => {
    const result = scoreRetrieval(
      ['Core Technical Expertise', 'Personal Information'],
      ['Core Technical Expertise', 'Personal Information', 'Why Work With Rockwell?']
    )
    expect(result.score).toBe(1.0)
    expect(result.matched).toEqual(['Core Technical Expertise', 'Personal Information'])
    expect(result.missed).toEqual([])
  })

  it('returns a partial score when only some expected sections were retrieved', () => {
    const result = scoreRetrieval(
      ['Core Technical Expertise', 'Personal Information'],
      ['Core Technical Expertise', 'Why Work With Rockwell?']
    )
    expect(result.score).toBe(0.5)
    expect(result.matched).toEqual(['Core Technical Expertise'])
    expect(result.missed).toEqual(['Personal Information'])
  })

  it('returns 0.0 when no expected sections were retrieved', () => {
    const result = scoreRetrieval(
      ['Core Technical Expertise', 'Personal Information'],
      ['Why Work With Rockwell?', 'Key Differentiators']
    )
    expect(result.score).toBe(0.0)
    expect(result.matched).toEqual([])
    expect(result.missed).toEqual(['Core Technical Expertise', 'Personal Information'])
  })

  it('returns 1.0 when expected is empty (personality/boundary/adversarial questions)', () => {
    const result = scoreRetrieval([], ['Core Technical Expertise', 'Personal Information'])
    expect(result.score).toBe(1.0)
    expect(result.matched).toEqual([])
    expect(result.missed).toEqual([])
  })

  it('returns 1.0 when both arrays are empty', () => {
    const result = scoreRetrieval([], [])
    expect(result.score).toBe(1.0)
  })

  it('is not penalised by extra retrieved chunks beyond what was expected', () => {
    const result = scoreRetrieval(
      ['Core Technical Expertise'],
      ['Core Technical Expertise', 'Personal Information', 'Key Differentiators', 'Why Work With Rockwell?']
    )
    expect(result.score).toBe(1.0)
    expect(result.matched).toEqual(['Core Technical Expertise'])
  })
})
