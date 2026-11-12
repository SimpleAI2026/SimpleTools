export interface EtaResult {
  remainingSeconds: number
  ratePerSecond: number
  finishAt: number
}

export function estimateEta(done: number, total: number, elapsedSeconds: number, now = Date.now()): EtaResult | null {
  if (!Number.isFinite(done) || !Number.isFinite(total) || !Number.isFinite(elapsedSeconds)) return null
  if (done <= 0 || total < done || elapsedSeconds <= 0) return null
  const rate = done / elapsedSeconds
  const remainingSeconds = (total - done) / rate
  return { remainingSeconds, ratePerSecond: rate, finishAt: now + remainingSeconds * 1000 }
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  if (hours) return `${hours}h ${minutes}m ${secs}s`
  if (minutes) return `${minutes}m ${secs}s`
  return `${secs}s`
}
