<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { downloadText } from '@/lib/download'
import { defaultInstructionsInput, generateInstructions, type InstructionTarget } from './logic'

const { t } = useI18n()
const form = reactive(defaultInstructionsInput())
function loadSample() {
  Object.assign(form, defaultInstructionsInput())
}
const target = ref<InstructionTarget>('agents')
const result = computed(() => generateInstructions(form, target.value))
const targetOptions = computed(() => [
  ['agents', t('tools.agent-instructions.targetAgents')] as const,
  ['claude', t('tools.agent-instructions.targetClaude')] as const,
  ['cursor', t('tools.agent-instructions.targetCursor')] as const,
  ['windsurf', t('tools.agent-instructions.targetWindsurf')] as const,
])
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <Label>{{ $t('tools.agent-instructions.projectName') }}</Label>
        <Input v-model="form.projectName" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label>{{ $t('tools.agent-instructions.stack') }}</Label>
        <Input v-model="form.stack" />
      </div>
      <div class="flex flex-col gap-1.5 sm:col-span-2">
        <Label>{{ $t('tools.agent-instructions.languages') }}</Label>
        <Input v-model="form.languages" />
      </div>
      <div class="flex flex-col gap-1.5 sm:col-span-2">
        <Label>{{ $t('tools.agent-instructions.standards') }}</Label>
        <Textarea v-model="form.standards" class="min-h-[120px] font-sans" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label>{{ $t('tools.agent-instructions.dos') }}</Label>
        <Textarea v-model="form.dos" class="min-h-[120px] font-sans" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label>{{ $t('tools.agent-instructions.donts') }}</Label>
        <Textarea v-model="form.donts" class="min-h-[120px] font-sans" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label>{{ $t('tools.agent-instructions.prCommands') }}</Label>
        <Textarea v-model="form.prCommands" class="min-h-[100px]" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label>{{ $t('tools.agent-instructions.testCommands') }}</Label>
        <Textarea v-model="form.testCommands" class="min-h-[100px]" />
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <Label>{{ $t('tools.agent-instructions.target') }}</Label>
      <ModeToggle v-model="target" :options="targetOptions" />
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between">
        <Label>{{ $t('common.preview') }} · <code class="font-mono text-xs">{{ result.filename }}</code></Label>
        <div class="flex gap-2">
          <CopyButton :text="result.content" />
          <Button size="sm" variant="outline" @click="downloadText(result.content, result.filename.split('/').pop()!)">{{ $t('common.download') }}</Button>
        </div>
      </div>
      <Textarea :model-value="result.content" readonly class="min-h-[500px] bg-muted/40 font-sans min-h-[500px] h-[500px]" />
    </div>
  </div>
</template>
