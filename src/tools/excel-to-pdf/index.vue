<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import SheetTable from '@/components/shared/SheetTable.vue'
import { downloadBlob } from '@/lib/download'
import { SPREADSHEET_ACCEPT, type SheetData } from '@/lib/excel'
import { pdfBlob } from '@/lib/pdf'
import { canvasesToPdf, pageSize, type PageSizeName, type RasterPage } from '@/lib/rasterPdf'
import { loadSampleExcel } from '@/lib/sampleExcel'
import { useSpreadsheet } from '@/lib/useSpreadsheet'
import { fitText, layoutTable } from './logic'

const { sheets, active, sheet, baseName, error, load } = useSpreadsheet()
async function loadSample() {
  await load(await loadSampleExcel())
}
const o = reactive({ size: 'a4' as PageSizeName, landscape: true, fontSize: 10, repeatHeader: true, gridlines: true, all: false })
const busy = ref(false)
const pageCount = ref(0)
const MARGIN = 36
const DPR = 2.5
const FONT = 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'

function renderSheet(s: SheetData): RasterPage[] {
  const [W, H] = pageSize(o.size, o.landscape)
  const mctx = document.createElement('canvas').getContext('2d')!
  const measure = (t: string, fs: number) => {
    mctx.font = `${fs}px ${FONT}`
    return mctx.measureText(t).width
  }
  const rows = s.rows.length ? s.rows : [['']]
  const titleH = 18
  const L = layoutTable(rows, measure, { width: W - MARGIN * 2, height: H - MARGIN * 2 - titleH, fontSize: o.fontSize, padding: 4, maxColWidth: 220, repeatHeader: o.repeatHeader })
  const fs = o.fontSize * L.scale
  return L.pages.map((pageRows, pi) => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(W * DPR)
    canvas.height = Math.round(H * DPR)
    const ctx = canvas.getContext('2d')!
    ctx.scale(DPR, DPR)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#666'
    ctx.font = `9px ${FONT}`
    ctx.fillText(`${s.name} — ${pi + 1}/${L.pages.length}`, MARGIN, MARGIN - 6 + 9)
    let y = MARGIN + titleH
    for (const ri of pageRows) {
      const isHead = ri === 0 && o.repeatHeader
      if (isHead) {
        ctx.fillStyle = '#f1f5f9'
        ctx.fillRect(MARGIN, y, L.colWidths.reduce((a, b) => a + b, 0), L.rowHeight)
      }
      let x = MARGIN
      ctx.font = `${isHead ? '600 ' : ''}${fs}px ${FONT}`
      ctx.fillStyle = '#111'
      ctx.textBaseline = 'middle'
      L.colWidths.forEach((w, c) => {
        const text = fitText(rows[ri]![c] ?? '', w - 8 * L.scale, (t) => ctx.measureText(t).width)
        const numeric = /^-?[\d,.]+%?$/.test(text)
        ctx.textAlign = numeric ? 'right' : 'left'
        ctx.fillText(text, numeric ? x + w - 4 * L.scale : x + 4 * L.scale, y + L.rowHeight / 2)
        if (o.gridlines) {
          ctx.strokeStyle = '#d4d4d8'
          ctx.lineWidth = 0.5
          ctx.strokeRect(x, y, w, L.rowHeight)
        }
        x += w
      })
      y += L.rowHeight
    }
    return { canvas, widthPt: W, heightPt: H }
  })
}

async function convert() {
  if (!sheet.value) return
  busy.value = true
  try {
    const pages = (o.all ? sheets.value : [sheet.value]).flatMap(renderSheet)
    pageCount.value = pages.length
    downloadBlob(pdfBlob(await canvasesToPdf(pages, 'png', 1, baseName.value)), `${baseName.value}.pdf`)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone :accept="SPREADSHEET_ACCEPT" :label="$t('tools.excel-to-pdf.drop')" @file="load" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <template v-if="sheet">
      <div class="flex flex-wrap items-center gap-3">
        <ModeToggle v-if="!o.all" v-model="active" :options="sheets.map((s, i) => [i, s.name] as const)" />
        <Label v-if="sheets.length > 1"><Switch v-model="o.all" /> {{ $t('tools.excel-to-pdf.allSheets') }}</Label>
        <ModeToggle v-model="o.size" :options="[['a4', 'A4'], ['a3', 'A3'], ['letter', 'Letter']]" />
        <Label><Switch v-model="o.landscape" /> {{ $t('tools.excel-to-pdf.landscape') }}</Label>
        <Label><Switch v-model="o.repeatHeader" /> {{ $t('tools.excel-to-pdf.repeatHeader') }}</Label>
        <Label><Switch v-model="o.gridlines" /> {{ $t('tools.excel-to-pdf.gridlines') }}</Label>
      </div>
      <RangeField v-model="o.fontSize" class="max-w-md" :label="$t('tools.excel-to-pdf.fontSize')" :min="6" :max="16" unit="pt" />
      <div class="flex items-center gap-3">
        <Button :disabled="busy" @click="convert"><Download /> {{ busy ? $t('common.processing') : $t('tools.excel-to-pdf.convert') }}</Button>
        <span v-if="pageCount" class="text-sm">{{ $t('tools.excel-to-pdf.pages', { n: pageCount }) }}</span>
      </div>
      <p class="text-muted-foreground text-xs">{{ $t('tools.excel-to-pdf.note') }}</p>
      <SheetTable :rows="sheet.rows" :limit="100" />
    </template>
  </div>
</template>
