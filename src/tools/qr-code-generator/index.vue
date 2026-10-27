<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { downloadBlob, downloadText } from '@/lib/download'
import { buildPayload, isValidHexColor, type QrContentType, type WifiData } from './logic'

const type = ref<QrContentType>('url')
const SAMPLE = 'https://github.com/linkxzhou/SimpleTools'
const value = ref(SAMPLE)
const extra = reactive({ subject: '', body: '' })
const wifi = reactive<WifiData>({ ssid: '', password: '', security: 'WPA', hidden: false })
const o = reactive({ size: [320], margin: [2], ecc: 'M' as 'L' | 'M' | 'Q' | 'H', fg: '#000000', bg: '#ffffff' })
const payload = computed(() => buildPayload(type.value, value.value, { ...extra, wifi: { ...wifi } }))
const dataUrl = ref('')
const svg = ref('')
const error = ref(false)

function loadSample() {
  type.value = 'url'
  value.value = SAMPLE
}

async function render() {
  const QR = await import('qrcode')
  const opts = {
    errorCorrectionLevel: o.ecc,
    margin: o.margin[0] ?? 2,
    width: o.size[0] ?? 320,
    color: { dark: isValidHexColor(o.fg) ? o.fg : '#000000', light: isValidHexColor(o.bg) ? o.bg : '#ffffff' },
  }
  try {
    if (!payload.value) throw new Error('empty')
    dataUrl.value = await QR.toDataURL(payload.value, opts)
    svg.value = await QR.toString(payload.value, { ...opts, type: 'svg' })
    error.value = false
  } catch {
    dataUrl.value = ''
    svg.value = ''
    error.value = payload.value.length > 0
  }
}
watch([payload, o], render, { immediate: true, deep: true })
async function savePng() {
  downloadBlob(await (await fetch(dataUrl.value)).blob(), 'qrcode.png')
}
const types: QrContentType[] = ['text', 'url', 'wifi', 'email', 'phone', 'sms']
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[1fr_auto]">
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
      </div>
      <ModeToggle v-model="type" :options="types.map((t) => [t, $t(`tools.qr-code-generator.types.${t}`)] as const)" />
      <template v-if="type === 'wifi'">
        <Input v-model="wifi.ssid" :placeholder="$t('tools.qr-code-generator.ssid')" />
        <Input v-model="wifi.password" :placeholder="$t('tools.qr-code-generator.password')" />
        <div class="flex flex-wrap items-center gap-3">
          <ModeToggle v-model="wifi.security" :options="[['WPA', 'WPA/WPA2'], ['WEP', 'WEP'], ['nopass', '—']]" />
          <Label><Switch v-model="wifi.hidden" /> {{ $t('tools.qr-code-generator.hidden') }}</Label>
        </div>
      </template>
      <template v-else>
        <Textarea v-if="type === 'text'" v-model="value" class="min-h-28 font-sans h-auto" :placeholder="$t('tools.qr-code-generator.content')" />
        <Input v-else v-model="value" :placeholder="$t('tools.qr-code-generator.content')" />
        <Input v-if="type === 'email'" v-model="extra.subject" :placeholder="$t('tools.qr-code-generator.subject')" />
        <Textarea v-if="type === 'email' || type === 'sms'" v-model="extra.body" class="min-h-20 font-sans h-auto" :placeholder="$t('tools.qr-code-generator.body')" />
      </template>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-2"><Label>{{ $t('tools.qr-code-generator.size') }}: {{ o.size[0] }}px</Label><Slider v-model="o.size" :min="128" :max="1024" :step="16" /></div>
        <div class="flex flex-col gap-2"><Label>{{ $t('tools.qr-code-generator.margin') }}: {{ o.margin[0] }}</Label><Slider v-model="o.margin" :min="0" :max="10" /></div>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm">{{ $t('tools.qr-code-generator.ecc') }}</span>
        <ModeToggle v-model="o.ecc" :options="[['L', 'L'], ['M', 'M'], ['Q', 'Q'], ['H', 'H']]" />
        <Label>{{ $t('tools.qr-code-generator.fg') }} <input v-model="o.fg" type="color" class="h-8 w-10" /></Label>
        <Label>{{ $t('tools.qr-code-generator.bg') }} <input v-model="o.bg" type="color" class="h-8 w-10" /></Label>
      </div>
      <p class="text-muted-foreground font-mono text-xs break-all">{{ payload }}</p>
    </div>
    <div class="flex flex-col items-center gap-3">
      <ErrorAlert v-if="error" :message="$t('tools.qr-code-generator.tooLong')" />
      <img v-if="dataUrl" :src="dataUrl" alt="QR" class="size-72 rounded border object-contain" />
      <div class="flex gap-2">
        <Button size="sm" variant="outline" :disabled="!dataUrl" @click="savePng"><Download /> {{ $t('tools.qr-code-generator.png') }}</Button>
        <Button size="sm" variant="outline" :disabled="!svg" @click="downloadText(svg, 'qrcode.svg', 'image/svg+xml')"><Download /> {{ $t('tools.qr-code-generator.svg') }}</Button>
      </div>
    </div>
  </div>
</template>
