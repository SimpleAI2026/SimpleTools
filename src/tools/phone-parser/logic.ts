import { parsePhoneNumberFromString } from 'libphonenumber-js/min'

export interface PhoneInfo {
  valid: boolean
  e164: string
  international: string
  national: string
  country: string
  type: string
}

export function parsePhone(input: string): PhoneInfo | null {
  const phone = parsePhoneNumberFromString(input.trim())
  if (!phone) return null
  return {
    valid: phone.isValid(),
    e164: phone.number,
    international: phone.formatInternational(),
    national: phone.formatNational(),
    country: phone.country ?? '',
    type: phone.getType() ?? '',
  }
}
