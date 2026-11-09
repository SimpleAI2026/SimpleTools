const unavailable = (): never => {
  throw new Error('This runtime is only available on the website')
}

export class LinuxKilled extends Error {}

export const linuxMachine = {
  shutdown() {},
  async runScript(): Promise<number> {
    return unavailable()
  },
}

export function attachLinuxConsole() {}
export function releaseWebRuntimes() {}
export function cancelPyodide() {}
export function cancelRustCompile() {}
export function pushPyodideEOF() {}
export function pushPyodideStdin() {}
export function rustReady() {
  return false
}
export async function rustIsCached() {
  return false
}
export async function rustCacheBytes() {
  return 0
}
export async function clearRustCache() {}
export async function bootLinux(): Promise<void> {
  unavailable()
}
export async function ensureRustToolchain(): Promise<void> {
  unavailable()
}
export async function compileRust(): Promise<never> {
  return unavailable()
}
export async function runPyodide(): Promise<never> {
  return unavailable()
}
