<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import TextIO from '@/components/shared/TextIO.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { describeChars, escapeUnicode, unescapeUnicode } from './logic'

const { t } = useI18n()
const mode = ref<'esc' | 'unesc'>('esc')
const all = ref(false)
const SAMPLE = 'Hi 中文 😀'
const input = ref(SAMPLE)
const res = computed(() => {
  if (mode.value === 'esc') return { out: escapeUnicode(input.value, all.value), err: '' }
  try {
    return { out: unescapeUnicode(input.value), err: '' }
  } catch {
    return { out: '', err: t('tools.utf8-converter.invalid') }
  }
})
const chars = computed(() => describeChars(mode.value === 'esc' ? input.value : res.value.out, 200))
const cols = ['char', 'codePoint', 'utf8', 'utf16', 'esc', 'html'] as const
</script>

<template>
  <div class="flex flex-col gap-6">
    <TextIO v-model="input" :output="res.out" :error="res.err" :sample="SAMPLE">
      <ModeToggle v-model="mode" :options="[['esc', $t('tools.utf8-converter.escape')], ['unesc', $t('tools.utf8-converter.unescape')]]" />
      <Label v-if="mode === 'esc'"><Switch v-model="all" /> {{ $t('tools.utf8-converter.escapeAll') }}</Label>
    </TextIO>
    <div class="overflow-x-auto rounded-md border">
      <table class="w-full text-sm">
        <thead class="bg-muted/50">
          <tr><th v-for="c in cols" :key="c" class="px-3 py-2 text-left font-medium">{{ $t(`tools.utf8-converter.${c}`) }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="(c, i) in chars" :key="i" class="border-t font-mono">
            <td class="px-3 py-1 text-base">{{ c.char }}</td><td class="px-3 py-1">{{ c.codePoint }}</td><td class="px-3 py-1">{{ c.utf8 }}</td>
            <td class="px-3 py-1">{{ c.utf16 }}</td><td class="px-3 py-1">{{ c.escape }}</td><td class="px-3 py-1">{{ c.html }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
