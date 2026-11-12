/** Shared constants for the id-photo offline assets (used by vite.config.ts and tests). */
export const ID_PHOTO_BUDGET_BYTES = 10_000_000
/** Single-thread tfjs wasm binaries; threads are disabled so the threaded build is never requested. */
export const ID_PHOTO_WASM = ['tfjs-backend-wasm.wasm', 'tfjs-backend-wasm-simd.wasm']
