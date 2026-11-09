import { cancelRustCompile } from '../rustc/compile'
import { clearRustCache, ensureRustToolchain, rustCacheBytes, rustIsCached, rustReady } from '../rustc/toolchain'
import { attachLinuxConsole, bootLinux, LinuxKilled, linuxMachine } from './linux'
import { cancelPyodide, pushPyodideEOF, pushPyodideStdin, runPyodide } from '../pyodide/run'
import { compileRust } from '../rustc/compile'

export {
  attachLinuxConsole,
  bootLinux,
  cancelPyodide,
  cancelRustCompile,
  clearRustCache,
  compileRust,
  ensureRustToolchain,
  LinuxKilled,
  linuxMachine,
  pushPyodideEOF,
  pushPyodideStdin,
  runPyodide,
  rustCacheBytes,
  rustIsCached,
  rustReady,
}

export function releaseWebRuntimes() {
  cancelRustCompile()
  cancelPyodide()
  linuxMachine.shutdown()
}
