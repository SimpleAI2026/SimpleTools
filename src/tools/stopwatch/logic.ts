export interface Lap {
  index: number
  totalMs: number
  splitMs: number
}

export function formatStopwatch(ms: number): string {
  const total = Math.max(0, Math.floor(ms))
  const hours = Math.floor(total / 3_600_000)
  const minutes = Math.floor((total % 3_600_000) / 60_000)
  const seconds = Math.floor((total % 60_000) / 1000)
  const millis = total % 1000
  const clock = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
  return hours ? `${hours}:${clock}` : clock
}

export function addLap(laps: Lap[], totalMs: number): Lap[] {
  const previous = laps.at(-1)?.totalMs ?? 0
  const total = Math.max(previous, Math.floor(totalMs))
  return [...laps, { index: laps.length + 1, totalMs: total, splitMs: total - previous }]
}

export function formatLaps(laps: Lap[]): string {
  return laps.map((lap) => `#${lap.index}\t${formatStopwatch(lap.splitMs)}\t${formatStopwatch(lap.totalMs)}`).join('\n')
}
