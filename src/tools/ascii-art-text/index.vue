<script setup lang="ts">
import { computed, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { asciiArt } from './logic'

const text = ref('SimpleTools')
const art = computed(() => asciiArt(text.value))
</script>

<template>
  <div class="flex flex-col gap-4">
    <Label class="flex flex-col items-start gap-2">{{ $t('tools.ascii-art-text.text') }}<Input v-model="text" maxlength="40" /></Label>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="art" /></div>
      <pre class="bg-muted/40 overflow-x-auto rounded-md border p-3 font-mono text-xs leading-tight" data-testid="tool-output">{{ art }}</pre>
    </section>
  </div>
</template>
