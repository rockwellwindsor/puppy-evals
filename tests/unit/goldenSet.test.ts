import { describe, it, expect } from 'vitest'
import { GoldenEntrySchema, GoldenSetSchema } from '../../src/types/goldenSet'

const validEntry = {
  id: 'gus-001',
  category: 'factual',
  question: 'How many years of Rails experience does Rockwell have?',
  expected_chunk_sections: ['Core Technical Expertise'],
  example_acceptable_answer: 'Rockwell has over 10 years of Rails experience, indeed.',
}

describe('GoldenEntrySchema', () => {
  it('accepts a valid entry', () => {
    expect(() => GoldenEntrySchema.parse(validEntry)).not.toThrow()
  })

  it('accepts an entry with optional notes', () => {
    expect(() => GoldenEntrySchema.parse({ ...validEntry, notes: 'tricky question' })).not.toThrow()
  })

  it('accepts empty expected_chunk_sections for personality questions', () => {
    expect(() => GoldenEntrySchema.parse({ ...validEntry, expected_chunk_sections: [] })).not.toThrow()
  })

  it('rejects an invalid category', () => {
    expect(() => GoldenEntrySchema.parse({ ...validEntry, category: 'random' })).toThrow()
  })

  it('rejects a missing question', () => {
    const { question: _, ...rest } = validEntry
    expect(() => GoldenEntrySchema.parse(rest)).toThrow()
  })

  it('rejects a missing id', () => {
    const { id: _, ...rest } = validEntry
    expect(() => GoldenEntrySchema.parse(rest)).toThrow()
  })
})

describe('GoldenSetSchema', () => {
  it('accepts an empty array', () => {
    expect(() => GoldenSetSchema.parse([])).not.toThrow()
  })

  it('accepts an array of valid entries', () => {
    expect(() => GoldenSetSchema.parse([validEntry])).not.toThrow()
  })

  it('rejects an array containing an invalid entry', () => {
    expect(() => GoldenSetSchema.parse([{ ...validEntry, category: 'bad' }])).toThrow()
  })
})
