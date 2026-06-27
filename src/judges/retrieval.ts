export interface RetrievalResult {
  score: number
  matched: string[]
  missed: string[]
}

export function scoreRetrieval(
  expected: string[],
  actual: string[]
): RetrievalResult {
  if (expected.length === 0) {
    return { score: 1.0, matched: [], missed: [] }
  }

  const actualSet = new Set(actual)
  const matched = expected.filter(section => actualSet.has(section))
  const missed = expected.filter(section => !actualSet.has(section))

  return {
    score: matched.length / expected.length,
    matched,
    missed,
  }
}
