<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from './CopyButton.vue'
import ErrorAlert from './ErrorAlert.vue'
import UsageSteps from './UsageSteps.vue'
import { downloadText } from '@/lib/download'
import { bytesToBase64, MAX_IMPORT_BYTES, type Presented } from '@/lib/workflow/core'

const props = withDefaults(defineProps<{ slug: string; sample: string; present: (input: string) => Presented; binary?: 'wav' | 'media' }>(), { binary: undefined })
const { t } = useI18n()
const input = ref(props.sample)
const tab = ref<'input' | 'output'>('input')
const fileError = ref('')

const result = computed(() => props.present(input.value))
const errorText = computed(() => {
  const code = fileError.value || result.value.error
  const key: Record<string, string> = {
    'too-large': 'common.tooLarge',
    empty: 'common.emptyInput',
    'invalid-json': 'common.invalidJson',
    'forbidden-key': 'common.forbiddenKey',
    'too-deep': 'common.tooDeep',
    'too-many-rows': 'common.tooManyRows',
    'invalid-csv': 'common.invalidCsv',
    'bad-input': 'common.badInput',
  }
  return code ? t(key[code] ?? 'common.badInput') : ''
})

async function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const limit = props.binary === 'media' ? 32_000_000 : props.binary === 'wav' ? 8_000_000 : MAX_IMPORT_BYTES
  if (file.size > limit) {
    fileError.value = 'too-large'
    return
  }
  fileError.value = ''
  if (props.binary === 'wav') {
    const bytes = new Uint8Array(await file.arrayBuffer())
    input.value = JSON.stringify({ wavBase64: bytesToBase64(bytes), window: 0 }, null, 2)
    return
  }
  if (props.binary === 'media') {
    try {
      const { runFfmpeg } = await import('@/tools/ffmpeg/engine')
      const probed = await runFfmpeg({ file, format: 'mp4', quality: 'low', mode: 'probe' })
      let contract: unknown = { width: 1280, height: 720 }
      try {
        const current = JSON.parse(input.value) as { contract?: unknown }
        if (current.contract) contract = current.contract
      } catch {
        /* keep the default contract */
      }
      input.value = JSON.stringify({ contract, probe: probed.log ?? '' }, null, 2)
    } catch {
      fileError.value = 'bad-input'
    }
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    input.value = String(reader.result ?? '')
  }
  reader.readAsText(file)
}

function save(name: string, text: string) {
  const type = name.endsWith('.csv') ? 'text/csv;charset=utf-8' : name.endsWith('.json') ? 'application/json' : 'text/plain;charset=utf-8'
  downloadText(text, name, type)
}
</script>

<template>
  <div class="flex flex-col gap-4 motion-reduce:transition-none">
    <p class="text-muted-foreground text-sm">{{ t('common.localNote') }} {{ t(`tools.${slug}.disclaimer`) }}</p>
    <div class="flex flex-wrap items-center gap-2">
      <label class="inline-flex min-h-11 cursor-pointer items-center">
        <input class="sr-only" type="file" :accept="binary === 'wav' ? '.wav,audio/wav' : binary === 'media' ? 'video/*,audio/*' : '.csv,.tsv,.txt,.json,.jsonl,.srt,.vtt,.md,text/plain'" @change="onFile" />
        <span class="border-input bg-background hover:bg-accent focus-within:ring-ring inline-flex min-h-11 items-center rounded-md border px-3 text-sm focus-within:ring-[3px]">{{ t('common.importFile') }}</span>
      </label>
      <Button type="button" variant="outline" class="min-h-11" @click="input = sample">{{ t('common.sample') }}</Button>
      <Button type="button" variant="outline" class="min-h-11" @click="input = ''">{{ t('common.clear') }}</Button>
    </div>
    <div class="flex gap-2 lg:hidden">
      <Button type="button" class="min-h-11 flex-1" :variant="tab === 'input' ? 'default' : 'outline'" @click="tab = 'input'">{{ t('common.input') }}</Button>
      <Button type="button" class="min-h-11 flex-1" :variant="tab === 'output' ? 'default' : 'outline'" @click="tab = 'output'">{{ t('common.output') }}</Button>
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      <Textarea v-model="input" :class="tab === 'input' ? '' : 'hidden lg:flex'" spellcheck="false" data-testid="tool-input" />
      <Textarea :model-value="result.jsonText" readonly class="bg-muted/40" :class="tab === 'output' ? '' : 'hidden lg:flex'" data-testid="tool-output" />
    </div>
    <p v-if="result.summary" class="text-sm">{{ result.summary }}</p>
    <div class="flex flex-wrap gap-2">
      <Button v-for="file in result.files" :key="file.name" type="button" variant="secondary" class="min-h-11" @click="save(file.name, file.text)">{{ file.name }}</Button>
      <CopyButton v-if="result.jsonText" :text="result.jsonText" />
    </div>
    <ErrorAlert v-if="errorText" :message="errorText" />
    <UsageSteps :slug="slug" />
  </div>
</template>
