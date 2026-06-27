export function parseJudgeResponse(text: string): unknown {
  const stripped = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(stripped)
}
