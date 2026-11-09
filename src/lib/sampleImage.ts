/** Fetch the bundled SimpleTools sample PNG as a File (for image tools). */
export async function loadSampleImage(filename = 'simpletools.png'): Promise<File> {
  const res = await fetch(`/samples/${filename}`)
  if (!res.ok) throw new Error(`sample image ${filename} missing`)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type || 'image/png' })
}
