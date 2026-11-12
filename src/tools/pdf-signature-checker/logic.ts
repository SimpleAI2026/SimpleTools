import { Certificate, ContentInfo, SignedData } from 'pkijs'

export interface PdfSignature {
  byteRange: [number, number, number, number] | null
  signer: string
  digest: string
  signingTime: string
  bytes: number
}

function latin1(bytes: Uint8Array): string {
  let text = ''
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return text
}

function hexToBytes(hex: string): Uint8Array | null {
  const cleaned = hex.replace(/\s+/g, '')
  if (!cleaned || cleaned.length % 2) return null
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    const value = Number.parseInt(cleaned.slice(i * 2, i * 2 + 2), 16)
    if (Number.isNaN(value)) return null
    bytes[i] = value
  }
  return bytes
}

function copyBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
}

export function describePkcs7(bytes: Uint8Array): Omit<PdfSignature, 'byteRange'> | null {
  try {
    const info = ContentInfo.fromBER(copyBuffer(bytes))
    if (info.contentType !== ContentInfo.SIGNED_DATA) return null
    const signed = new SignedData({ schema: info.content })
    const digest = signed.digestAlgorithms.map((algo) => algo.algorithmId).filter(Boolean).join(', ')
    let signer = ''
    let signingTime = ''
    for (const item of signed.certificates ?? []) {
      if (item instanceof Certificate) {
        signer = item.subject.typesAndValues.map((part) => String(part.value.valueBlock.value)).filter(Boolean).join(', ')
        if (signer) break
      }
    }
    const first = signed.signerInfos[0]
    for (const attr of first?.signedAttrs?.attributes ?? []) {
      if (attr.type === '1.2.840.113549.1.9.5') {
        const value = attr.values[0]
        const raw = value && 'toDate' in value && typeof value.toDate === 'function' ? value.toDate() : null
        signingTime = raw instanceof Date ? raw.toISOString() : ''
      }
    }
    return { signer: signer || 'embedded certificate', digest: digest || 'unknown', signingTime, bytes: bytes.byteLength }
  } catch {
    return null
  }
}

export function extractPdfSignatures(data: Uint8Array): PdfSignature[] {
  const text = latin1(data)
  const ranges = [...text.matchAll(/\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/g)].map((match) => ({
    index: match.index ?? 0,
    range: [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])] as [number, number, number, number],
  }))
  const contents = [...text.matchAll(/\/Contents\s*<([0-9A-Fa-f\s]+)>/g)]
  return contents.flatMap((match) => {
    const bytes = hexToBytes(match[1] ?? '')
    if (!bytes) return []
    const described = describePkcs7(bytes)
    if (!described) return []
    const at = match.index ?? 0
    const byteRange = [...ranges].reverse().find((range) => range.index <= at)?.range ?? null
    return [{ ...described, byteRange }]
  })
}
