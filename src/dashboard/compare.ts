export type DeltaClassification = 'improved' | 'regressed' | 'unchanged'

export function sortRunsForComparison<RunRecord extends { id: string; createdAt: Date | null }>(
  runs: RunRecord[],
  selected: Set<string>
): [RunRecord, RunRecord] | null {
  const selectedRuns = runs
    .filter(run => selected.has(run.id))
    .sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0
      const bTime = b.createdAt ? b.createdAt.getTime() : 0
      return aTime - bTime
    })
  if (selectedRuns.length !== 2) return null
  return [selectedRuns[0], selectedRuns[1]]
}


export function classifyDelta(delta: number): DeltaClassification {
  if (delta > 0) return 'improved'
  if (delta < 0) return 'regressed'
  return 'unchanged'
}

export function summarizeComparison(
  runA: Array<{ groundingScore: number; personaScore: number; retrievalScore: number }>,
  runB: Array<{ groundingScore: number; personaScore: number; retrievalScore: number }>
): { improved: number; regressed: number; unchanged: number } {
  let improved = 0
  let regressed = 0
  let unchanged = 0

  const len = Math.min(runA.length, runB.length)
  for (let i = 0; i < len; i++) {
    const groundingDelta = runB[i].groundingScore - runA[i].groundingScore
    const personaDelta = runB[i].personaScore - runA[i].personaScore
    const retrievalDelta = runB[i].retrievalScore - runA[i].retrievalScore

    const anyImproved = groundingDelta > 0 || personaDelta > 0 || retrievalDelta > 0
    const anyRegressed = groundingDelta < 0 || personaDelta < 0 || retrievalDelta < 0

    if (anyRegressed) regressed++
    else if (anyImproved) improved++
    else unchanged++
  }

  return { improved, regressed, unchanged }
}
