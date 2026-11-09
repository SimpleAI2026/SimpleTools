import { createWorker, type Worker } from 'tesseract.js'
import { offlineUrl } from '@/lib/offlineAssets'
import { collectWordBoxes, formatBlocks, type OcrLangId, type OutputMode, type Roi, type WordBox } from './logic'

let worker: Worker | null = null
let loadedKey = ''

function ocrBase() {
  return offlineUrl('ocr').replace(/\/$/, '')
}

/** LSTM-only worker (OEM 1) pointed at vendored offline assets. */
export async function ensureOcrWorker(lang: string, onProgress?: (p: number) => void): Promise<Worker> {
  const key = `${lang}|1`
  if (worker && loadedKey === key) return worker
  if (worker) {
    await worker.terminate()
    worker = null
    loadedKey = ''
  }
  const base = ocrBase()
  worker = await createWorker(lang, 1, {
    workerPath: `${base}/worker.min.js`,
    corePath: `${base}`,
    langPath: `${base}/traineddata`,
    gzip: true,
    cacheMethod: 'none',
    logger: (m) => {
      if (typeof m.progress === 'number' && onProgress) onProgress(Math.round(m.progress * 100))
    },
  })
  loadedKey = key
  return worker
}

export async function terminateOcrWorker() {
  if (worker) {
    await worker.terminate()
    worker = null
    loadedKey = ''
  }
}

export async function recognizeImage(opts: {
  image: File | Blob
  lang: OcrLangId | string
  psm: string
  whitelist?: string
  blacklist?: string
  roi?: Roi
  mode: OutputMode
  onProgress?: (p: number) => void
}): Promise<{ text: string; confidence: number; words: WordBox[]; hocr?: string; tsv?: string }> {
  const w = await ensureOcrWorker(opts.lang, opts.onProgress)
  const params: Record<string, string> = { tessedit_pageseg_mode: opts.psm }
  if (opts.whitelist) params.tessedit_char_whitelist = opts.whitelist
  if (opts.blacklist) params.tessedit_char_blacklist = opts.blacklist
  await w.setParameters(params as Parameters<Worker['setParameters']>[0])
  const { data } = await w.recognize(opts.image, opts.roi ? { rectangle: opts.roi } : undefined, {
    text: true,
    blocks: true,
    hocr: opts.mode === 'hocr' || opts.mode === 'box',
    tsv: opts.mode === 'tsv',
  })
  const words = collectWordBoxes(data)
  let text = data.text?.trim() ?? ''
  if (opts.mode === 'blocks') text = formatBlocks(data) || text
  if (opts.mode === 'hocr') text = data.hocr ?? text
  if (opts.mode === 'tsv') text = data.tsv ?? text
  if (opts.mode === 'box') {
    text = words.map((x) => `${x.text}\t${x.bbox.x0} ${x.bbox.y0} ${x.bbox.x1} ${x.bbox.y1}\t${Math.round(x.confidence)}`).join('\n')
  }
  return { text, confidence: Math.round(data.confidence || 0), words, hocr: data.hocr ?? undefined, tsv: data.tsv ?? undefined }
}
