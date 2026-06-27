import { config } from 'dotenv'
config({ path: '.env.local', override: true })

import { readFileSync } from 'fs'
import { join } from 'path'
import { runEvals } from './runner'
import { GoldenSetSchema } from './types/goldenSet'

const args = process.argv.slice(2)
const command = args[0]

function getFlag(flag: string): string | undefined {
  const i = args.indexOf(flag)
  return i !== -1 ? args[i + 1] : undefined
}

function loadGoldenSet(filename: string) {
  const path = join(process.cwd(), 'golden-sets', filename)
  const raw = JSON.parse(readFileSync(path, 'utf-8'))
  return GoldenSetSchema.parse(raw)
}

async function run() {
  if (command !== 'run') {
    console.error(`Unknown command: ${command}. Usage: npm run evals -- run --label <name> [--golden gus|mitch]`)
    process.exit(1)
  }

  const label = getFlag('--label')
  if (!label) {
    console.error('--label is required. Usage: npm run evals -- run --label "baseline"')
    process.exit(1)
  }

  const goldenFlag = getFlag('--golden')
  const puppies: Array<'gus' | 'mitch'> = goldenFlag
    ? [goldenFlag as 'gus' | 'mitch']
    : ['gus', 'mitch']

  for (const puppy of puppies) {
    const goldenSet = loadGoldenSet(`${puppy}.json`)
    console.log(`\nRunning ${goldenSet.length} questions for ${puppy}...`)

    const summary = await runEvals({ puppy, label, goldenSet })

    console.log(`\n── ${puppy.toUpperCase()} RESULTS ──`)
    console.log(`  Retrieval : ${(summary.retrieval * 100).toFixed(1)}%`)
    console.log(`  Grounding : ${summary.grounding.toFixed(2)} / 5`)
    console.log(`  Persona   : ${summary.persona.toFixed(2)} / 5`)
    console.log(`  Questions : ${summary.totalQuestions}`)
    console.log(`  Run ID    : ${summary.runId}`)
  }
}

run().then(() => process.exit(0)).catch(err => {
  console.error('Eval run failed:', err)
  process.exit(1)
})
