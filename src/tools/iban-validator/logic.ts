const LENGTHS = 'AD24AE23AL28AT20AZ28BA20BE16BG22BH22BR29BY28CH21CR22CY28CZ24DE22DK18DO28EE20EG29ES24FI18FO18FR27GB22GE22GI23GL18GR27GT28HR21HU28IE22IL23IQ23IS26IT27JO30KW30KZ20LB28LC32LI21LT20LU20LV21MC27MD24ME22MK19MR27MT31MU30NL18NO15PK24PL28PS29PT25QA29RO24RS22SA24SC31SE24SI19SK24SM27ST25SV28TL23TN24TR26UA29VG24XK20'

const countryLength = new Map<string, number>()
for (let i = 0; i < LENGTHS.length; i += 4) countryLength.set(LENGTHS.slice(i, i + 2), Number(LENGTHS.slice(i + 2, i + 4)))

export interface IbanParts {
  country: string
  checkDigits: string
  bban: string
  formatted: string
  valid: boolean
  knownLength: boolean
}

export function parseIban(input: string): IbanParts | null {
  const compact = input.replace(/[^0-9a-z]/gi, '').toUpperCase()
  if (compact.length < 5) return null
  const country = compact.slice(0, 2)
  const checkDigits = compact.slice(2, 4)
  const bban = compact.slice(4)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(compact)) return null
  const expected = countryLength.get(country)
  const knownLength = expected !== undefined
  const lengthOk = expected === undefined ? compact.length >= 15 && compact.length <= 34 : compact.length === expected
  const rearranged = `${bban}${country}${checkDigits}`
  let acc = 0
  for (const char of rearranged) {
    const digits = char >= 'A' ? String(char.charCodeAt(0) - 55) : char
    for (const digit of digits) acc = (acc * 10 + Number(digit)) % 97
  }
  const formatted = compact.replace(/(.{4})/g, '$1 ').trim()
  return { country, checkDigits, bban, formatted, valid: lengthOk && acc === 1, knownLength }
}
