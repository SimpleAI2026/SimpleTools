export interface KeyInfo {
  key: string
  code: string
  keyCode: number
  location: number
  alt: boolean
  ctrl: boolean
  shift: boolean
  meta: boolean
  repeat: boolean
}

export function keyInfoFrom(event: Pick<KeyboardEvent, 'key' | 'code' | 'keyCode' | 'location' | 'altKey' | 'ctrlKey' | 'shiftKey' | 'metaKey' | 'repeat'>): KeyInfo {
  return {
    key: event.key,
    code: event.code,
    keyCode: event.keyCode,
    location: event.location,
    alt: event.altKey,
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    meta: event.metaKey,
    repeat: event.repeat,
  }
}

export function formatKeyInfo(info: KeyInfo): string {
  return [
    `key: ${info.key}`,
    `code: ${info.code}`,
    `keyCode: ${info.keyCode}`,
    `location: ${info.location}`,
    `alt: ${info.alt}`,
    `ctrl: ${info.ctrl}`,
    `shift: ${info.shift}`,
    `meta: ${info.meta}`,
    `repeat: ${info.repeat}`,
  ].join('\n')
}
