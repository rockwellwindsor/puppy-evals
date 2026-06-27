export function scoreColor(score: number | null, max: number): string {
  if (score == null) return 'text-zinc-400'
  const ratio = score / max
  if (ratio >= 0.8) return 'text-green-600'
  if (ratio >= 0.6) return 'text-yellow-600'
  return 'text-red-600'
}

export function isFailure(result: {
  groundingScore: number | null
  personaScore: number | null
}): boolean {
  return (result.groundingScore ?? 5) < 3 || (result.personaScore ?? 5) < 3
}
