import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { catchError, errMessage, runBusy, withBusy } from './runBusy'

describe('errMessage', () => {
  it('reads Error.message and stringifies other values', () => {
    expect(errMessage(new Error('boom'))).toBe('boom')
    expect(errMessage('x')).toBe('x')
    expect(errMessage(42)).toBe('42')
  })
})

describe('runBusy', () => {
  it('sets busy around success and returns the value', async () => {
    const busy = ref(false)
    const error = ref('old')
    const order: string[] = []
    const result = await runBusy({ busy, error }, async () => {
      order.push(busy.value ? 'busy' : 'idle')
      return 7
    })
    expect(result).toBe(7)
    expect(busy.value).toBe(false)
    expect(error.value).toBe('old')
    expect(order).toEqual(['busy'])
  })

  it('captures errors without rethrowing and optionally clears first', async () => {
    const busy = ref(false)
    const error = ref('stale')
    const result = await runBusy({ busy, error }, async () => {
      throw new Error('fail')
    }, { clearError: true })
    expect(result).toBeUndefined()
    expect(busy.value).toBe(false)
    expect(error.value).toBe('fail')
  })

  it('supports custom mapError', async () => {
    const busy = ref(false)
    const error = ref('')
    await runBusy({ busy, error }, async () => {
      throw new Error('ignored')
    }, { mapError: () => 'localized' })
    expect(error.value).toBe('localized')
  })
})

describe('catchError', () => {
  it('assigns error and returns undefined on throw', async () => {
    const error = ref('')
    const result = await catchError(error, async () => {
      throw new Error('nope')
    })
    expect(result).toBeUndefined()
    expect(error.value).toBe('nope')
  })

  it('returns the value on success', async () => {
    const error = ref('')
    expect(await catchError(error, async () => 'ok')).toBe('ok')
    expect(error.value).toBe('')
  })
})

describe('withBusy', () => {
  it('clears busy and rethrows', async () => {
    const busy = ref(false)
    await expect(
      withBusy(busy, async () => {
        expect(busy.value).toBe(true)
        throw new Error('x')
      }),
    ).rejects.toThrow('x')
    expect(busy.value).toBe(false)
  })

  it('returns the value', async () => {
    const busy = ref(false)
    await expect(withBusy(busy, async () => 3)).resolves.toBe(3)
    expect(busy.value).toBe(false)
  })
})
