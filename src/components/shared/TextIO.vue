<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="$slots.default" class="flex flex-wrap items-center gap-2"><slot /></div>
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <div class="flex min-h-0 flex-col gap-2">
        <div class="flex h-8 shrink-0 items-center justify-between">
          <Label>{{ $t('common.input') }}</Label>
          <div class="flex gap-2">
            <button
              v-if="sample != null && sample !== ''"
              type="button"
              class="text-muted-foreground hover:text-foreground text-xs"
              @click="input = sample"
            >
              {{ $t('common.sample') }}
            </button>
            <button type="button" class="text-muted-foreground hover:text-foreground text-xs" @click="input = ''">{{ $t('common.clear') }}</button>
          </div>
        </div>
        <Textarea v-model="input" :placeholder="placeholder" :class="['min-h-[500px] h-[500px]', mono ? '' : 'font-sans']" spellcheck="false" data-testid="tool-input" />
      </div>
      <div class="flex min-h-0 flex-col gap-2">
        <div class="flex h-8 shrink-0 items-center justify-between">
          <Label>{{ $t('common.output') }}</Label>
          <CopyButton :text="output" />
        </div>
        <Textarea :model-value="output" readonly :class="['min-h-[500px] h-[500px] bg-muted/40 break-all', mono ? '' : 'font-sans']" data-testid="tool-output" />
      </div>
    </div>
    <ErrorAlert v-if="error" :message="error" />
  </div>
</template>
