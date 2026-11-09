/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useObjectUrl } from './useObjectUrl'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useObjectUrl', () => {
  it('creates, replaces, and revokes object URLs including on unmount', () => {
    const created: Blob[] = []
    const revoked: string[] = []
    let n = 0
    vi.stubGlobal(
      'URL',
      {
        createObjectURL: (b: Blob) => {
          created.push(b)
          return `blob:mock-${++n}`
        },
        revokeObjectURL: (u: string) => {
          revoked.push(u)
        },
      } as unknown as typeof URL,
    )

    let api!: ReturnType<typeof useObjectUrl>
    const host = mount(defineComponent({
      setup() {
        api = useObjectUrl()
        return () => h('div')
      },
    }))
    const { url, setObject, revoke } = api
    expect(url.value).toBe('')

    const a = new Blob(['a'])
    setObject(a)
    expect(url.value).toBe('blob:mock-1')
    expect(created).toEqual([a])

    const b = new Blob(['b'])
    setObject(b)
    expect(url.value).toBe('blob:mock-2')
    expect(revoked).toEqual(['blob:mock-1'])

    setObject(null)
    expect(url.value).toBe('')
    expect(revoked).toEqual(['blob:mock-1', 'blob:mock-2'])

    setObject(a)
    revoke()
    expect(url.value).toBe('')
    expect(revoked.at(-1)).toBe('blob:mock-3')

    setObject(b)
    host.unmount()
    expect(url.value).toBe('')
    expect(revoked.at(-1)).toBe('blob:mock-4')
  })
})
