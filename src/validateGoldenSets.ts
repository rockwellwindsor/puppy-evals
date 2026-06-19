import { readFileSync } from 'fs'
import { join } from 'path'
import { GoldenSetSchema } from './types/goldenSet'

const files = ['gus.json', 'mitch.json']

let allValid = true

for (const file of files) {
  const path = join(process.cwd(), 'golden-sets', file)
  const raw = JSON.parse(readFileSync(path, 'utf-8'))
  const result = GoldenSetSchema.safeParse(raw)

  if (result.success) {
    console.log(`✓ ${file} — ${result.data.length} entries`)
  } else {
    console.error(`✗ ${file} — validation failed:`)
    console.error(result.error.format())
    allValid = false
  }
}

if (!allValid) process.exit(1)
