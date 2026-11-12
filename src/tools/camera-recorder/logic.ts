const CANDIDATES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']

export function preferredRecorderMime(isSupported: (mime: string) => boolean = supported): string {
  return CANDIDATES.find((mime) => isSupported(mime)) ?? ''
}

export function extensionForMime(mime: string): string {
  if (mime.includes('mp4')) return 'mp4'
  return 'webm'
}

function supported(mime: string): boolean {
  return typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)
}
