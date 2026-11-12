export async function generateUla(now = Date.now(), random?: Uint8Array): Promise<{ prefix: string; firstSubnet: string }> {
  const entropy = random ?? crypto.getRandomValues(new Uint8Array(8))
  const time = new Uint8Array(8)
  const view = new DataView(time.buffer)
  view.setBigUint64(0, BigInt(Math.max(0, Math.floor(now))))
  const material = new ArrayBuffer(16)
  const viewMaterial = new Uint8Array(material)
  viewMaterial.set(time, 0)
  viewMaterial.set(entropy.slice(0, 8), 8)
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-1', material))
  const globalId = digest.slice(0, 5)
  const bytes = [0xfd, ...globalId]
  const groups = [((bytes[0] ?? 0) << 8) | (bytes[1] ?? 0), ((bytes[2] ?? 0) << 8) | (bytes[3] ?? 0), ((bytes[4] ?? 0) << 8) | (bytes[5] ?? 0)]
  const prefix = `${groups.map((group) => group.toString(16)).join(':')}::/48`
  return { prefix, firstSubnet: prefix.replace('::/48', ':1::/64') }
}

export function isUlaPrefix(prefix: string): boolean {
  return /^fd[0-9a-f]{2}:[0-9a-f]{1,4}:[0-9a-f]{1,4}::\/48$/i.test(prefix)
}
