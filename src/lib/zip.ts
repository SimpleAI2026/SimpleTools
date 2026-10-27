/** Build a ZIP archive from named blobs; fflate is loaded on demand. */
export async function zipBlobs(entries: { name: string; blob: Blob }[]): Promise<Blob> {
  const { zip } = await import('fflate')
  const files: Record<string, Uint8Array> = {}
  for (const e of entries) {
    let name = e.name
    for (let i = 2; name in files; i++) name = e.name.replace(/(\.[^.]+)?$/, `-${i}$1`)
    files[name] = new Uint8Array(await e.blob.arrayBuffer())
  }
  const data = await new Promise<Uint8Array>((resolve, reject) => zip(files, { level: 0 }, (err, out) => (err ? reject(err) : resolve(out))))
  return new Blob([data as BlobPart], { type: 'application/zip' })
}
