import { z } from 'zod'

export const GoldenEntrySchema = z.object({
  id: z.string(),
  category: z.enum(['factual', 'personality', 'boundary', 'adversarial']),
  question: z.string(),
  expected_chunk_sections: z.array(z.string()),
  example_acceptable_answer: z.string(),
  notes: z.string().optional(),
})

export const GoldenSetSchema = z.array(GoldenEntrySchema)

export type GoldenEntry = z.infer<typeof GoldenEntrySchema>
export type GoldenSet = z.infer<typeof GoldenSetSchema>
