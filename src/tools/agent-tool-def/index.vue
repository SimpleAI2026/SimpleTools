<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import {
  convertToolJson,
  emptyParam,
  exportTool,
  sampleTool,
  validateToolName,
  type ParamType,
  type ToolFormat,
} from './logic'

const { t } = useI18n()
const mode = ref<'form' | 'convert'>('form')
const format = ref<ToolFormat>('mcp')
const name = ref('get_weather')
const description = ref('Get current weather for a city')
const params = ref(sampleTool().params.map((p) => ({ ...p })))
const paste = ref('')
const types: ParamType[] = ['string', 'number', 'integer', 'boolean', 'array', 'object']

const nameErr = computed(() => {
  const e = validateToolName(name.value)
  if (e === 'empty') return t('tools.agent-tool-def.nameErrorEmpty')
  if (e === 'pattern') return t('tools.agent-tool-def.nameErrorPattern')
  return ''
})

const formOut = computed(() =>
  exportTool({ name: name.value, description: description.value, params: params.value }, format.value),
)

const converted = computed(() => {
  if (!paste.value.trim()) return { err: '', mcp: '', openai: '', anthropic: '' }
  try {
    const c = convertToolJson(paste.value)
    return { err: '', ...c }
  } catch {
    return { err: t('tools.agent-tool-def.convertError'), mcp: '', openai: '', anthropic: '' }
  }
})

const modeOptions = computed(() => [
  ['form', t('tools.agent-tool-def.modeForm')] as const,
  ['convert', t('tools.agent-tool-def.modeConvert')] as const,
])
const formatOptions = computed(() => [
  ['mcp', t('tools.agent-tool-def.formatMcp')] as const,
  ['openai', t('tools.agent-tool-def.formatOpenai')] as const,
  ['anthropic', t('tools.agent-tool-def.formatAnthropic')] as const,
])

function loadSample() {
  const s = sampleTool()
  name.value = s.name
  description.value = s.description
  params.value = s.params.map((p) => ({ ...p }))
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <ModeToggle v-model="mode" :options="modeOptions" />
    <template v-if="mode === 'form'">
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <Label>{{ $t('tools.agent-tool-def.toolName') }}</Label>
          <Input v-model="name" class="font-mono" />
          <ErrorAlert v-if="nameErr" :message="nameErr" />
        </div>
        <div class="flex flex-col gap-1.5 sm:col-span-2">
          <Label>{{ $t('tools.agent-tool-def.toolDesc') }}</Label>
          <Input v-model="description" />
        </div>
      </div>
      <div>
        <div class="mb-2 flex items-center justify-between">
          <Label>{{ $t('tools.agent-tool-def.params') }}</Label>
          <div class="flex gap-2">
            <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
            <Button size="sm" variant="outline" @click="params.push(emptyParam())">{{ $t('tools.agent-tool-def.addParam') }}</Button>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div v-for="(p, i) in params" :key="i" class="grid items-end gap-2 rounded-md border p-2 sm:grid-cols-5">
            <div class="flex flex-col gap-1">
              <span class="text-muted-foreground text-xs">{{ $t('tools.agent-tool-def.paramName') }}</span>
              <Input v-model="p.name" class="font-mono" />
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-muted-foreground text-xs">{{ $t('tools.agent-tool-def.paramType') }}</span>
              <select v-model="p.type" class="border-input bg-background h-9 rounded-md border px-2">
                <option v-for="ty in types" :key="ty" :value="ty">{{ ty }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1 sm:col-span-2">
              <span class="text-muted-foreground text-xs">{{ $t('tools.agent-tool-def.paramDesc') }}</span>
              <Input v-model="p.description" />
            </div>
            <div class="flex items-center justify-between gap-2">
              <Label class="flex items-center gap-2 font-normal"><Switch v-model="p.required" /> {{ $t('tools.agent-tool-def.required') }}</Label>
              <Button size="sm" variant="ghost" @click="params.splice(i, 1)">{{ $t('common.remove') }}</Button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <Label>{{ $t('tools.agent-tool-def.format') }}</Label>
        <ModeToggle v-model="format" :options="formatOptions" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex h-8 items-center justify-between">
          <Label>{{ $t('common.output') }}</Label>
          <CopyButton :text="formOut" />
        </div>
        <Textarea :model-value="formOut" readonly class="min-h-[500px] bg-muted/40 min-h-[500px] h-[500px]" />
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col gap-2">
        <Label>{{ $t('tools.agent-tool-def.paste') }}</Label>
        <Textarea v-model="paste" class="min-h-[240px]" />
        <ErrorAlert v-if="converted.err" :message="converted.err" />
      </div>
      <div v-for="k in (['mcp', 'openai', 'anthropic'] as const)" :key="k" class="flex flex-col gap-2">
        <div class="flex h-8 items-center justify-between">
          <Label>{{ $t(`tools.agent-tool-def.format${k === 'mcp' ? 'Mcp' : k === 'openai' ? 'Openai' : 'Anthropic'}`) }}</Label>
          <CopyButton :text="converted[k]" />
        </div>
        <Textarea :model-value="converted[k]" readonly class="min-h-[200px] bg-muted/40" />
      </div>
    </template>
  </div>
</template>
