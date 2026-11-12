<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download, LayoutGrid, RotateCcw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { makeCanvas } from '@/lib/canvas'
import { downloadBlob } from '@/lib/download'
import { loadSampleImage } from '@/lib/sampleImage'
import {
  BG_PRESETS,
  chooseCrown,
  computeCrop,
  crownFromAlpha,
  customSpec,
  eyeAngle,
  kb,
  layoutSheet,
  mmToPx,
  rotatePoint,
  SHEETS,
  SPECS,
  type PhotoSpec,
} from './logic'
import { alphaToMask, canvasAlpha, composePhoto, composeSheet, cutout, encodeJpeg, encodePng, fileToCanvas, hasTransparency, rotateCanvas, type Encoded } from './render'

type Engine = typeof import('./engine')

const { t } = useI18n()
const p = (k: string, args?: Record<string, unknown>) => t(`tools.id-photo.${k}`, args ?? {})

const specId = ref('one-inch')
const custom = reactive({ w: 295, h: 413, dpi: 300, kbMin: 0, kbMax: 0 })
const bg = ref('#438edb')
const useMatting = ref(true)
const autoRotate = ref(true)
const adjust = reactive({ zoom: 1, dx: 0, dy: 0 })
const format = ref<'jpg' | 'png'>('jpg')
const kbMin = ref(0)
const kbMax = ref(0)
const sheetId = ref('6inch')

const busy = ref(false)
const status = ref('')
const error = ref('')
const warning = ref('')
const timing = reactive({ backend: '', detect: 0, matte: 0 })
const fileName = ref('id-photo')

const source = shallowRef<HTMLCanvasElement | null>(null)
const transparent = ref(false)
const face = shallowRef<Awaited<ReturnType<Engine['detectFace']>>>(null)
const rotated = shallowRef<HTMLCanvasElement | null>(null)
const angle = ref(0)
const alpha = shallowRef<Float32Array | null>(null)
const subject = shallowRef<HTMLCanvasElement | null>(null)
const photo = shallowRef<HTMLCanvasElement | null>(null)
const encoded = shallowRef<Encoded | null>(null)
const photoUrl = ref('')
const sheetUrl = ref('')
const sheetInfo = ref('')

let engine: Engine | null = null
const MATTE = 512

const spec = computed<PhotoSpec>(() => {
  if (specId.value === 'custom') return customSpec(custom.w, custom.h, custom.dpi, custom.kbMin, custom.kbMax)
  return SPECS.find((s) => s.id === specId.value) ?? SPECS[0]!
})
const specOptions = computed(() => [...SPECS.map((s) => ({ id: s.id, label: `${p(`spec.${s.id}`)} · ${s.widthMm}×${s.heightMm} mm · ${s.widthPx}×${s.heightPx} px` })), { id: 'custom', label: p('spec.custom') }])

watch(spec, (s) => {
  kbMin.value = s.kbMin ?? 0
  kbMax.value = s.kbMax ?? 0
  if (s.bg) bg.value = BG_PRESETS.find((b) => b.id === s.bg)?.color ?? bg.value
}, { immediate: true })

async function loadEngine(): Promise<Engine> {
  if (!engine) {
    status.value = p('loadingRuntime')
    engine = await import('./engine')
    timing.backend = await engine.initBackend()
  }
  return engine
}

function setUrl(target: typeof photoUrl, blob: Blob | null) {
  if (target.value) URL.revokeObjectURL(target.value)
  target.value = blob ? URL.createObjectURL(blob) : ''
}

async function onFile(f: File) {
  error.value = ''
  warning.value = ''
  busy.value = true
  try {
    fileName.value = f.name.replace(/\.[^.]+$/, '') || 'id-photo'
    source.value = await fileToCanvas(f)
    transparent.value = hasTransparency(source.value)
    adjust.zoom = 1
    adjust.dx = 0
    adjust.dy = 0
    const eng = await loadEngine()
    status.value = p('detecting')
    const t0 = performance.now()
    face.value = await eng.detectFace(source.value)
    timing.detect = Math.round(performance.now() - t0)
    if (!face.value) warning.value = p('noFace')
    await prepare()
  } catch (e) {
    error.value = `${p('failed')} ${e instanceof Error ? e.message : String(e)}`
  } finally {
    busy.value = false
    status.value = ''
  }
}

async function loadSample() {
  await onFile(await loadSampleImage('portrait.jpg'))
}

/** Alpha of the unrotated source (from the model or the PNG itself); rotation is applied to the mask afterwards. */
const sourceAlpha = shallowRef<Float32Array | null>(null)

/** Matte the unrotated photo (or reuse the PNG alpha), then rotate and build the cut-out subject. */
async function prepare() {
  const src = source.value
  if (!src) return
  sourceAlpha.value = null
  if (transparent.value) {
    sourceAlpha.value = canvasAlpha(src, MATTE, MATTE)
  } else if (useMatting.value) {
    const eng = await loadEngine()
    status.value = p('mattingStatus')
    const t0 = performance.now()
    sourceAlpha.value = await eng.matte(src)
    timing.matte = Math.round(performance.now() - t0)
  }
  applyRotation()
}

/** Straighten photo and mask together; no model work here. */
function applyRotation() {
  const src = source.value
  if (!src) return
  const f = face.value
  const a = autoRotate.value && f ? Math.max(-20, Math.min(20, -eyeAngle(f.eyes[0], f.eyes[1]))) : 0
  angle.value = Math.round(a * 10) / 10
  const rot = rotateCanvas(src, a)
  rotated.value = rot
  const useAlpha = sourceAlpha.value && (useMatting.value || transparent.value)
  if (useAlpha) {
    const mask = rotateCanvas(alphaToMask(sourceAlpha.value!, MATTE, MATTE, src.width, src.height), a)
    alpha.value = canvasAlpha(mask, MATTE, MATTE)
    subject.value = cutout(rot, mask)
  } else {
    alpha.value = null
    subject.value = rot
  }
  render()
}

const head = computed(() => {
  const src = source.value
  const rot = rotated.value
  if (!src || !rot) return null
  const f = face.value
  if (!f) return { crownY: rot.height * 0.12, chinY: rot.height * 0.6, centerX: rot.width / 2 }
  const map = (pt: { x: number; y: number }) => rotatePoint(pt, src.width, src.height, angle.value)
  const e0 = map(f.eyes[0])
  const e1 = map(f.eyes[1])
  const c = map({ x: f.box.xMin + f.box.width / 2, y: f.box.yMin + f.box.height / 2 })
  const eyeY = (e0.y + e1.y) / 2
  const chinY = c.y + f.box.height / 2
  let matteCrown: number | null = null
  if (alpha.value && (useMatting.value || transparent.value)) {
    const sx = MATTE / rot.width
    const y = crownFromAlpha(alpha.value, MATTE, MATTE, (c.x - f.box.width * 0.35) * sx, (c.x + f.box.width * 0.35) * sx)
    matteCrown = y == null ? null : (y * rot.height) / MATTE
  }
  return { crownY: chooseCrown(matteCrown, eyeY, chinY), chinY, centerX: (e0.x + e1.x) / 2 }
})

function render() {
  const sub = subject.value
  const h = head.value
  if (!sub || !h) return
  const s = spec.value
  photo.value = composePhoto(sub, computeCrop(h, s, adjust), s.widthPx, s.heightPx, bg.value)
  void encode()
}

let encodeSeq = 0
async function encode() {
  const c = photo.value
  if (!c) return
  const seq = ++encodeSeq
  const s = spec.value
  const out = format.value === 'png' ? await encodePng(c, s.dpi) : await encodeJpeg(c, s.dpi, kbMin.value || undefined, kbMax.value || undefined)
  if (seq !== encodeSeq) return
  encoded.value = out
  setUrl(photoUrl, out.blob)
  await renderSheet()
}

async function renderSheet() {
  const c = photo.value
  if (!c) return
  const sheet = SHEETS.find((x) => x.id === sheetId.value) ?? SHEETS[1]!
  const s = spec.value
  const pw = mmToPx(s.widthMm, 300)
  const ph = mmToPx(s.heightMm, 300)
  const [scaled, sctx] = makeCanvas(pw, ph)
  sctx.imageSmoothingQuality = 'high'
  sctx.drawImage(c, 0, 0, pw, ph)
  const layout = layoutSheet(sheet, pw, ph, 300)
  sheetInfo.value = p('sheetCount', { n: layout.cells.length })
  if (!layout.cells.length) {
    setUrl(sheetUrl, null)
    return
  }
  const out = await encodeJpeg(composeSheet(scaled, layout), 300)
  setUrl(sheetUrl, out.blob)
}

watch([spec, bg, () => ({ ...adjust })], () => render(), { deep: true })
watch([format, kbMin, kbMax], () => void encode())
watch(sheetId, () => void renderSheet())
watch(useMatting, async (on) => {
  if (!source.value) return
  if (on && !sourceAlpha.value) {
    busy.value = true
    try {
      await prepare()
    } catch (e) {
      error.value = `${p('failed')} ${e instanceof Error ? e.message : String(e)}`
    } finally {
      busy.value = false
      status.value = ''
    }
  } else applyRotation()
})
watch(autoRotate, () => applyRotation())

function resetAdjust() {
  adjust.zoom = 1
  adjust.dx = 0
  adjust.dy = 0
}

function downloadPhoto() {
  if (!encoded.value) return
  const s = spec.value
  downloadBlob(encoded.value.blob, `${fileName.value}-${s.widthPx}x${s.heightPx}.${format.value}`)
}
async function downloadSheet() {
  if (!sheetUrl.value) return
  const blob = await (await fetch(sheetUrl.value)).blob()
  downloadBlob(blob, `${fileName.value}-${sheetId.value}.jpg`)
}

const sizeLabel = computed(() => (encoded.value ? kb(encoded.value.blob.size) : ''))
const sizeOk = computed(() => encoded.value?.ok ?? true)

onBeforeUnmount(() => {
  encodeSeq++
  setUrl(photoUrl, null)
  setUrl(sheetUrl, null)
  engine?.disposeModels()
})
</script>

<template>
  <div class="flex flex-col gap-4" :data-busy="busy ? 'true' : 'false'">
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <!-- Controls -->
      <div class="flex min-w-0 flex-col gap-4">
        <FileDropzone accept="image/*" :label="p('drop')" @file="onFile" />
        <div class="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
          <span v-if="busy" class="text-muted-foreground text-sm">{{ status || $t('common.processing') }}</span>
        </div>
        <ErrorAlert v-if="error" :message="error" />
        <p v-if="warning" class="rounded-md border border-amber-500/40 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">{{ warning }}</p>

        <label class="flex flex-col gap-1 text-sm">
          <span>{{ p('specLabel') }}</span>
          <select v-model="specId" class="border-input bg-background h-10 w-full min-w-0 rounded-md border px-3">
            <option v-for="o in specOptions" :key="o.id" :value="o.id">{{ o.label }}</option>
          </select>
        </label>
        <div v-if="specId === 'custom'" class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Label class="flex flex-col items-start gap-1">{{ p('widthPx') }} <Input v-model.number="custom.w" type="number" min="16" /></Label>
          <Label class="flex flex-col items-start gap-1">{{ p('heightPx') }} <Input v-model.number="custom.h" type="number" min="16" /></Label>
          <Label class="flex flex-col items-start gap-1">DPI <Input v-model.number="custom.dpi" type="number" min="72" /></Label>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-sm">{{ p('background') }}</span>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="b in BG_PRESETS"
              :key="b.id"
              type="button"
              :title="p(`bg.${b.id}`)"
              :aria-label="p(`bg.${b.id}`)"
              class="size-8 rounded-full border-2"
              :class="bg.toLowerCase() === b.color ? 'border-primary ring-primary/40 ring-2' : 'border-border'"
              :style="{ background: b.color }"
              @click="bg = b.color"
            />
            <label class="flex items-center gap-2 text-sm">
              <input v-model="bg" type="color" class="h-8 w-10 cursor-pointer rounded border" :aria-label="p('customColor')" />
              <span class="font-mono text-xs">{{ bg }}</span>
            </label>
          </div>
        </div>

        <div class="flex flex-wrap gap-4">
          <Label><Switch v-model="useMatting" :disabled="busy || transparent" /> {{ p('matting') }}</Label>
          <Label><Switch v-model="autoRotate" :disabled="busy" /> {{ p('autoRotate') }}</Label>
        </div>
        <p v-if="transparent" class="text-muted-foreground text-xs">{{ p('transparentHint') }}</p>

        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-sm">{{ p('adjust') }}</span>
            <Button size="sm" variant="ghost" @click="resetAdjust"><RotateCcw /> {{ $t('common.reset') }}</Button>
          </div>
          <RangeField v-model="adjust.zoom" :label="p('zoom')" :min="0.6" :max="1.6" :step="0.01" />
          <RangeField v-model="adjust.dx" :label="p('offsetX')" :min="-0.3" :max="0.3" :step="0.01" />
          <RangeField v-model="adjust.dy" :label="p('offsetY')" :min="-0.3" :max="0.3" :step="0.01" />
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <ModeToggle v-model="format" :options="[['jpg', 'JPG'], ['png', 'PNG']]" />
          <template v-if="format === 'jpg'">
            <Label>{{ p('kbMin') }} <Input v-model.number="kbMin" type="number" min="0" class="w-20" /></Label>
            <Label>{{ p('kbMax') }} <Input v-model.number="kbMax" type="number" min="0" class="w-20" /></Label>
          </template>
        </div>
      </div>

      <!-- Output -->
      <div class="flex min-w-0 flex-col gap-4">
        <section class="rounded-lg border">
          <header class="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
            <span class="text-sm font-medium">{{ $t('common.result') }}</span>
            <Button size="sm" :disabled="!encoded" @click="downloadPhoto"><Download /> {{ $t('common.download') }}</Button>
          </header>
          <div class="flex flex-col items-center gap-2 p-3">
            <img v-if="photoUrl" :src="photoUrl" :alt="$t('common.preview')" class="max-h-80 max-w-full border shadow-sm" data-testid="id-photo-result" />
            <p v-else class="text-muted-foreground py-10 text-sm">{{ p('empty') }}</p>
            <p v-if="encoded" class="text-muted-foreground text-center text-xs">
              {{ spec.widthPx }}×{{ spec.heightPx }} px · {{ spec.dpi }} DPI · <span :class="sizeOk ? '' : 'text-destructive'">{{ sizeLabel }}</span>
              <template v-if="angle"> · {{ p('rotated', { deg: angle }) }}</template>
            </p>
            <p v-if="encoded && !sizeOk" class="text-destructive text-xs">{{ p('sizeMiss') }}</p>
            <p v-if="timing.backend && (timing.detect || timing.matte)" class="text-muted-foreground text-xs" data-testid="id-photo-timing">
              {{ p('timing', { backend: timing.backend, detect: timing.detect, matte: timing.matte }) }}
            </p>
          </div>
        </section>

        <section class="rounded-lg border">
          <header class="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
            <span class="flex items-center gap-2 text-sm font-medium"><LayoutGrid class="size-4" /> {{ p('sheet') }}</span>
            <div class="flex flex-wrap items-center gap-2">
              <ModeToggle v-model="sheetId" :options="SHEETS.map((s) => [s.id, p(`sheets.${s.id}`)] as const)" />
              <Button size="sm" variant="outline" :disabled="!sheetUrl" @click="downloadSheet"><Download /> {{ $t('common.download') }}</Button>
            </div>
          </header>
          <div class="flex flex-col items-center gap-2 p-3">
            <img v-if="sheetUrl" :src="sheetUrl" :alt="p('sheet')" class="max-h-80 max-w-full border" />
            <p v-if="sheetInfo && photoUrl" class="text-muted-foreground text-xs">{{ sheetInfo }}</p>
          </div>
        </section>
      </div>
    </div>
    <p class="text-muted-foreground text-xs">{{ p('privacy') }}</p>
  </div>
</template>
