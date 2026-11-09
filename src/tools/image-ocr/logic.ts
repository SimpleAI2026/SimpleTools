export const OCR_LANGS = [
  { id: 'eng', labelZh: '英语', labelEn: 'English' },
  { id: 'chi_sim', labelZh: '简体中文', labelEn: 'Chinese (Simplified)' },
  { id: 'eng+chi_sim', labelZh: '中英混合', labelEn: 'English + Chinese' },
] as const

export type OcrLangId = (typeof OCR_LANGS)[number]['id']

export const PSM_OPTIONS = [
  { id: '3', labelZh: '自动', labelEn: 'Auto' },
  { id: '1', labelZh: '自动+OSD', labelEn: 'Auto + OSD' },
  { id: '4', labelZh: '单列', labelEn: 'Single column' },
  { id: '6', labelZh: '单块', labelEn: 'Single block' },
  { id: '7', labelZh: '单行', labelEn: 'Single line' },
  { id: '8', labelZh: '单词', labelEn: 'Single word' },
  { id: '11', labelZh: '稀疏文本', labelEn: 'Sparse text' },
  { id: '12', labelZh: '稀疏+OSD', labelEn: 'Sparse + OSD' },
  { id: '13', labelZh: '原始行', labelEn: 'Raw line' },
] as const

export type OutputMode = 'text' | 'blocks' | 'hocr' | 'tsv' | 'box'

export function isOcrLang(v: string): v is OcrLangId {
  return OCR_LANGS.some((l) => l.id === v)
}

export interface Roi {
  left: number
  top: number
  width: number
  height: number
}

export function parseRoi(left: number, top: number, width: number, height: number): Roi | undefined {
  if (width <= 0 || height <= 0) return undefined
  return { left: Math.max(0, left), top: Math.max(0, top), width, height }
}

export interface WordBox {
  text: string
  confidence: number
  bbox: { x0: number; y0: number; x1: number; y1: number }
}

/** Flatten tesseract words from blocks/paragraphs/lines. */
export function collectWordBoxes(data: {
  words?: Array<{ text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }> | null
  blocks?: Array<{
    paragraphs?: Array<{
      lines?: Array<{
        words?: Array<{ text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }> | null
      }> | null
    }> | null
  }> | null
} | null | undefined): WordBox[] {
  if (!data) return []
  if (data.words?.length) {
    return data.words.map((w) => ({ text: w.text, confidence: w.confidence, bbox: w.bbox }))
  }
  const out: WordBox[] = []
  for (const b of data.blocks ?? []) {
    for (const p of b.paragraphs ?? []) {
      for (const line of p.lines ?? []) {
        for (const w of line.words ?? []) out.push({ text: w.text, confidence: w.confidence, bbox: w.bbox })
      }
    }
  }
  return out
}

export function formatBlocks(data: {
  blocks?: Array<{ text: string; confidence: number }> | null
  confidence?: number
} | null): string {
  if (!data?.blocks?.length) return ''
  return data.blocks.map((b, i) => `[#${i + 1} conf=${Math.round(b.confidence)}]\n${b.text}`).join('\n\n')
}
