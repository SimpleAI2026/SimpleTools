<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import CopyButton from './CopyButton.vue'
import ErrorAlert from './ErrorAlert.vue'

/** Standard two-pane text tool: editable input (v-model) and read-only output. Options go in the default slot. */
withDefaults(defineProps<{ output: string; error?: string; placeholder?: string; mono?: boolean; sample?: string }>(), {
  error: '',
  placeholder: '',
  mono: true,
  sample: undefined,
})
const input = defineModel<string>({ required: true })
const tab = ref<'input' | 'output'>('input')
const paneClass = 'min-h-[min(500px,45dvh)] h-[min(500px,45dvh)]'
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="$slots.default" class="flex flex-wrap items-center gap-2"><slot /></div>
    <div class="flex gap-2 lg:hidden" data-testid="textio-tabs">
      <Button size="sm" class="min-h-11 flex-1" :variant="tab === 'input' ? 'default' : 'outline'" @click="tab = 'input'">{{ $t('common.input') }}</Button>
      <Button size="sm" class="min-h-11 flex-1" :variant="tab === 'output' ? 'default' : 'outline'" @click="tab = 'output'">{{ $t('common.output') }}</Button>
    </div>
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <div class="flex min-h-0 flex-col gap-2" :class="tab === 'input' ? '' : 'hidden lg:flex'">
        <div class="flex h-8 shrink-0 items-center justify-between">
          <Label class="hidden lg:inline">{{ $t('common.input') }}</Label>
          <div class="ml-auto flex gap-2">
            <button
              v-if="sample != null && sample !== ''"
              type="button"
              class="text-muted-foreground hover:text-foreground min-h-11 px-2 text-xs lg:min-h-0"
              @click="input = sample"
            >
              {{ $t('common.sample') }}
            </button>
            <button type="button" class="text-muted-foreground hover:text-foreground min-h-11 px-2 text-xs lg:min-h-0" @click="input = ''">{{ $t('common.clear') }}</button>
          </div>
        </div>
        <Textarea v-model="input" :placeholder="placeholder" :class="[paneClass, mono ? '' : 'font-sans']" spellcheck="false" data-testid="tool-input" />
      </div>
      <div class="flex min-h-0 flex-col gap-2" :class="tab === 'output' ? '' : 'hidden lg:flex'">
        <div class="flex h-8 shrink-0 items-center justify-between">
          <Label class="hidden lg:inline">{{ $t('common.output') }}</Label>
          <CopyButton class="ml-auto" :text="output" />
        </div>
        <Textarea :model-value="output" readonly :class="[paneClass, 'bg-muted/40 break-all', mono ? '' : 'font-sans']" data-testid="tool-output" />
      </div>
    </div>
    <ErrorAlert v-if="error" :message="error" />
  </div>
</template>
