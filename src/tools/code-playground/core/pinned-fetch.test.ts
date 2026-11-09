import { describe, expect, it, vi } from 'vitest'
import { bodyLooksLikeHtml, classifyPinned, fetchPinned, hasWasmMagic, PinnedMismatch, PinnedMissing, sha256Hex, versionedUrl } from './pinned-fetch'

const SHA = '7f3828e4b7bddf5504dadebfc4016e40f4441e15ee0519071781813ba2ed3a4c'
function wasmBytes(size: number) {
  const bytes = new Uint8Array(size)
  bytes.set([0x00, 0x61, 0x73, 0x6d])
  return bytes
}
function response(body: string | Uint8Array, status = 200, type = 'application/octet-stream') {
  return new Response(typeof body === 'string' ? body : new Uint8Array(body), { status, headers: { 'content-type': type } })
}

describe('pinned code assets', () => {
  it('versions URLs and identifies HTML, WASM magic, and size mismatches', async () => {
    expect(versionedUrl('/code/a.wasm?x=1', SHA)).toBe('/code/a.wasm?x=1&v=7f3828e4b7bd')
    expect(versionedUrl('/code/a.wasm?v=old#h', SHA)).toBe('/code/a.wasm?v=7f3828e4b7bd#h')
    const html = new TextEncoder().encode('<!doctype html><html></html>')
    expect(bodyLooksLikeHtml(html)).toBe(true)
    expect(classifyPinned({ status: 200, contentType: 'text/html', bytes: html })).toBe('missing')
    expect(hasWasmMagic(wasmBytes(8))).toBe(true)
    expect(classifyPinned({ status: 200, contentType: 'application/wasm', bytes: wasmBytes(8), expectBytes: 16, wasm: true })).toBe('mismatch')
    expect(classifyPinned({ status: 200, contentType: 'application/wasm', bytes: wasmBytes(8), expectBytes: 8, wasm: true })).toBe('ok')
    expect(await sha256Hex(new Uint8Array())).toMatch(/^[0-9a-f]{64}$/)
  })

  it('reloads a stale HTML response once and returns real WASM', async () => {
    const good = wasmBytes(16)
    const queue = [response('<!doctype html><html></html>', 200, 'text/html'), response(good, 200, 'application/wasm')]
    const caches: RequestCache[] = []
    const bytes = await fetchPinned({
      url: '/code/a.wasm', version: SHA, expectBytes: 16, expectedSha256: SHA, wasm: true,
      hash: async () => SHA,
      fetchImpl: vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        caches.push(init?.cache ?? 'default')
        return queue.shift()!
      }) as typeof fetch,
    })
    expect(bytes).toEqual(good)
    expect(caches).toEqual(['no-cache', 'reload'])
  })

  it('distinguishes missing files from byte mismatches', async () => {
    await expect(fetchPinned({
      url: '/code/missing.wasm', wasm: true,
      fetchImpl: vi.fn(async () => response('<!doctype html>', 200, 'text/html')) as typeof fetch,
    })).rejects.toBeInstanceOf(PinnedMissing)

    const error = await fetchPinned({
      url: '/code/short.wasm', expectBytes: 32, wasm: true,
      fetchImpl: vi.fn(async () => response(wasmBytes(8), 200, 'application/wasm')) as typeof fetch,
    }).catch((value: unknown) => value)
    expect(error).toBeInstanceOf(PinnedMismatch)
    expect((error as PinnedMismatch).got).toBe(8)
    expect((error as PinnedMismatch).expected).toBe(32)
  })

  it('honors retryNotFound false and never retries aborts', async () => {
    const fetch404 = vi.fn(async () => response('missing', 404, 'text/plain')) as typeof fetch
    await expect(fetchPinned({ url: '/code/a.wasm', retryNotFound: false, fetchImpl: fetch404 })).rejects.toBeInstanceOf(PinnedMissing)
    expect(fetch404).toHaveBeenCalledOnce()
    const abort = new DOMException('aborted', 'AbortError')
    const fetchAbort = vi.fn(async () => { throw abort }) as typeof fetch
    await expect(fetchPinned({ url: '/code/a.wasm', fetchImpl: fetchAbort })).rejects.toBe(abort)
    expect(fetchAbort).toHaveBeenCalledOnce()
  })
})
