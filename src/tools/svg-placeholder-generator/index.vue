<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { downloadText } from '@/lib/download'
import { placeholderSvg } from './logic'

const width = ref(640)
const height = ref(360)
const background = ref('#e5e7eb')
const foreground = ref('#111827')
const text = ref('')
const result = computed(() => placeholderSvg({ width: width.value, height: height.value, background: background.value, foreground: foreground.value, text: text.value }))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.svg-placeholder-generator.width') }}<Input v-model.number="width" type="number" min="1" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.svg-placeholder-generator.height') }}<Input v-model.number="height" type="number" min="1" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.svg-placeholder-generator.bg') }}<Input v-model="background" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.svg-placeholder-generator.fg') }}<Input v-model="foreground" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.svg-placeholder-generator.label') }}<Input v-model="text" :placeholder="$t('tools.svg-placeholder-generator.auto')" /></Label>
    </div>
    <img :src="result.dataUrl" alt="" class="max-w-full rounded-md border" data-testid="svg-preview" />
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between">
        <Label>{{ $t('common.output') }}</Label>
        <div class="flex gap-2">
          <CopyButton :text="result.svg" />
          <Button size="sm" variant="outline" @click="downloadText(result.svg, 'placeholder.svg', 'image/svg+xml')">{{ $t('common.download') }}</Button>
        </div>
      </div>
      <pre class="bg-muted/40 max-h-48 overflow-auto rounded-md border p-3 font-mono text-xs break-all whitespace-pre-wrap" data-testid="tool-output">{{ result.svg }}</pre>
    </section>
  </div>
</template>
