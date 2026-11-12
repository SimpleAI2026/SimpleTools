import { describe, expect, it } from 'vitest'
import { assertRsaPemUsable, clampRsaSize, generateRsaPem, pemBody } from './logic'

describe('rsa-key-pair-generator', () => {
  it('clamps modulus size', () => {
    expect(clampRsaSize(1024)).toBe(2048)
    expect(clampRsaSize(3072)).toBe(3072)
    expect(clampRsaSize(8000)).toBe(4096)
  })

  it('exports PKCS#8 and SPKI PEM that re-import', async () => {
    const pem = await generateRsaPem(2048, 'sign')
    expect(pem.publicKey).toContain('BEGIN PUBLIC KEY')
    expect(pem.privateKey).toContain('BEGIN PRIVATE KEY')
    expect(pemBody(pem.publicKey, 'PUBLIC KEY')).toBeTruthy()
    expect(await assertRsaPemUsable(pem)).toBe(true)
    const message = new TextEncoder().encode('simpletools')
    const privateKey = await crypto.subtle.importKey('pkcs8', pemBody(pem.privateKey, 'PRIVATE KEY') as ArrayBuffer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'])
    const publicKey = await crypto.subtle.importKey('spki', pemBody(pem.publicKey, 'PUBLIC KEY') as ArrayBuffer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, message)
    expect(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, sig, message)).toBe(true)
  })
})
