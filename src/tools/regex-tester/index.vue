<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { segments, type RegexResult } from './logic'

const { t } = useI18n()
const SAMPLE_PATTERN = '(?<user>[\\w.]+)@(?<domain>[\\w.]+)'
const SAMPLE_FLAGS = 'g'
const SAMPLE_TEXT = 'Contact: alice@example.com, bob.smith@mail.cn'
const pattern = ref(SAMPLE_PATTERN)
const flags = ref(SAMPLE_FLAGS)
const text = ref(SAMPLE_TEXT)
const replacement = ref('')
const result = ref<RegexResult | null>(null)
const error = ref('')
let worker: Worker | null = null
let timer: ReturnType<typeof setTimeout> | undefined

function run() {
  worker?.terminate()
  clearTimeout(timer)
  worker = new Worker(new URL('./regex.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (e: MessageEvent<{ ok: boolean; result?: RegexResult; error?: string }>) => {
    clearTimeout(timer)
    if (e.data.ok) {
      result.value = e.data.result ?? null
      error.value = ''
    } else {
      result.value = null
      error.value = e.data.error ?? ''
    }
  }
  timer = setTimeout(() => {
    worker?.terminate()
    worker = null
    result.value = null
    error.value = t('tools.regex-tester.timeout')
  }, 1500)
  worker.postMessage({ pattern: pattern.value, flags: flags.value, text: text.value, replacement: replacement.value === '' ? null : replacement.value })
}
watchDebounced([pattern, flags, text, replacement], run, { debounce: 150, immediate: true })
onBeforeUnmount(() => {
  worker?.terminate()
  clearTimeout(timer)
})
const segs = computed(() => (result.value ? segments(text.value, result.value.matches) : [{ text: text.value, match: null }]))
const colors = ['bg-amber-300/60', 'bg-sky-300/60']

function loadSample() {
  pattern.value = SAMPLE_PATTERN
  flags.value = SAMPLE_FLAGS
  text.value = SAMPLE_TEXT
  replacement.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex gap-2">
      <div class="flex flex-1 flex-col gap-2"><Label for="re">{{ $t('tools.regex-tester.pattern') }}</Label><Input id="re" v-model="pattern" class="font-mono" /></div>
      <div class="flex w-28 flex-col gap-2"><Label for="fl">{{ $t('tools.regex-tester.flags') }}</Label><Input id="fl" v-model="flags" class="font-mono" /></div>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <Label>{{ $t('tools.regex-tester.text') }}</Label>
        <Textarea v-model="text" class="min-h-[500px] min-h-[500px] h-[500px]" />
        <pre class="bg-muted/30 min-h-[500px] overflow-auto rounded-md border p-3 font-mono text-sm whitespace-pre-wrap min-h-[500px] h-[500px]"><span v-for="(s, i) in segs" :key="i" :class="s.match !== null ? `${colors[s.match % 2]} rounded-sm` : ''">{{ s.text }}</span></pre>
      </div>
      <div class="flex flex-col gap-2">
        <Label>{{ result ? $t('tools.regex-tester.matches', { n: result.matches.length }) : '' }}</Label>
        <p v-if="result?.truncated" class="text-muted-foreground text-xs">{{ $t('tools.regex-tester.truncated') }}</p>
        <div class="flex max-h-72 flex-col gap-2 overflow-auto">
          <div v-for="(m, i) in result?.matches ?? []" :key="i" class="rounded-md border p-2 font-mono text-xs">
            <div><b>#{{ i + 1 }}</b> @{{ m.index }}: <span class="bg-amber-300/40">{{ m.text }}</span></div>
            <div v-for="(g, gi) in m.groups" :key="gi" class="text-muted-foreground">{{ $t('tools.regex-tester.group') }} {{ gi + 1 }}: {{ g ?? '∅' }}</div>
            <div v-for="(v, k) in m.named" :key="k" class="text-muted-foreground">&lt;{{ k }}&gt;: {{ v ?? '∅' }}</div>
          </div>
        </div>
        <Input v-model="replacement" class="font-mono" :placeholder="$t('tools.regex-tester.replace')" />
        <div v-if="result?.replaced != null" class="flex items-start gap-2">
          <pre class="bg-muted/40 flex-1 overflow-auto rounded-md border p-2 font-mono text-sm whitespace-pre-wrap">{{ result.replaced }}</pre>
          <CopyButton :text="result.replaced" :label="false" />
        </div>
      </div>
    </div>
  </div>
</template>
