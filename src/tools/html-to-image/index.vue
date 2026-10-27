<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DOMPurify from 'dompurify'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { downloadBlob } from '@/lib/download'
import { clampDimension, composeFragment, SANITIZE_CONFIG } from './logic'

const { t } = useI18n()
const SAMPLE_HTML = `<div class="card">
  <div class="logo">ST</div>
  <h1>SimpleTools</h1>
  <p>Offline-first toolkit · 本地优先工具箱</p>
</div>`
const SAMPLE_CSS = `.card {
  padding: 40px 48px;
  border-radius: 20px;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6 50%, #ec4899);
  font-family: system-ui, sans-serif;
  text-align: center;
  min-width: 360px;
}
.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 12px;
  border-radius: 14px;
  background: rgba(255,255,255,.2);
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.02em;
}
.card h1 { margin: 0 0 8px; font-size: 36px; font-weight: 700; }
.card p { margin: 0; opacity: 0.9; font-size: 15px; }`
const html = ref(SAMPLE_HTML)
const css = ref(SAMPLE_CSS)
const width = ref(480)
const scale = ref(2)
const transparent = ref(false)
const bg = ref('#ffffff')
const format = ref<'png' | 'jpeg' | 'svg'>('png')
const busy = ref(false)
const error = ref('')
const stage = ref<HTMLElement | null>(null)
const safe = computed(() => DOMPurify.sanitize(composeFragment(html.value, css.value), SANITIZE_CONFIG) as string)

function loadSample() {
  html.value = SAMPLE_HTML
  css.value = SAMPLE_CSS
}

async function exportImage() {
  if (!stage.value) return
  busy.value = true
  error.value = ''
  try {
    const lib = await import('html-to-image')
    const opts = { pixelRatio: scale.value, backgroundColor: transparent.value && format.value !== 'jpeg' ? undefined : bg.value, cacheBust: true }
    if (format.value === 'svg') {
      const dataUrl = await lib.toSvg(stage.value, opts)
      downloadBlob(await (await fetch(dataUrl)).blob(), 'html.svg')
    } else {
      const blob = format.value === 'png' ? await lib.toBlob(stage.value, opts) : await (await fetch(await lib.toJpeg(stage.value, { ...opts, quality: 0.92 }))).blob()
      if (!blob) throw new Error('empty')
      downloadBlob(blob, `html.${format.value === 'png' ? 'png' : 'jpg'}`)
    }
  } catch {
    error.value = t('tools.html-to-image.failed')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <Label>{{ $t('tools.html-to-image.html') }}</Label>
        <Textarea v-model="html" class="min-h-[500px] font-mono min-h-[500px] h-[500px]" spellcheck="false" data-testid="tool-input" />
      </div>
      <div class="flex flex-col gap-2">
        <Label>{{ $t('tools.html-to-image.css') }}</Label>
        <Textarea v-model="css" class="min-h-[500px] font-mono min-h-[500px] h-[500px]" spellcheck="false" />
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <Label>{{ $t('tools.html-to-image.width') }} <Input v-model.number="width" type="number" class="w-24" /></Label>
      <span class="text-sm">{{ $t('tools.html-to-image.scale') }}</span>
      <ModeToggle v-model="scale" :options="[[1, '1×'], [2, '2×'], [3, '3×']]" />
      <ModeToggle v-model="format" :options="[['png', 'PNG'], ['jpeg', 'JPG'], ['svg', 'SVG']]" />
      <Label><Switch v-model="transparent" /> {{ $t('tools.html-to-image.transparent') }}</Label>
      <input v-if="!transparent || format === 'jpeg'" v-model="bg" type="color" class="h-8 w-10 rounded border" :aria-label="$t('tools.html-to-image.background')" />
      <Button :disabled="busy" @click="exportImage"><Download /> {{ busy ? $t('common.processing') : $t('tools.html-to-image.export') }}</Button>
    </div>
    <p class="text-muted-foreground text-xs">{{ $t('tools.html-to-image.note') }}</p>
    <ErrorAlert v-if="error" :message="error" />
    <div class="bg-muted/30 overflow-auto rounded-md border p-4">
      <!-- eslint-disable-next-line vue/no-v-html -- sanitized with DOMPurify -->
      <div ref="stage" class="mx-auto" :style="{ width: `${clampDimension(width)}px`, background: transparent ? 'transparent' : bg }" v-html="safe" />
    </div>
  </div>
</template>
