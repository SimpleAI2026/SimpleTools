import { describe, expect, it } from 'vitest'
import { formatKeyInfo, keyInfoFrom } from './logic'

describe('keycode-info', () => {
  it('copies the keyboard event fields', () => {
    const info = keyInfoFrom({ key: 'a', code: 'KeyA', keyCode: 65, location: 0, altKey: false, ctrlKey: true, shiftKey: false, metaKey: false, repeat: false })
    expect(formatKeyInfo(info)).toContain('code: KeyA')
    expect(formatKeyInfo(info)).toContain('ctrl: true')
  })
})
