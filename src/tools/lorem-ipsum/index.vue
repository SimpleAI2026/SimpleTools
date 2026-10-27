<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { generateLorem, type Lang, type Unit } from './logic'

const DEFAULTS = { unit: 'paragraphs' as Unit, count: 3, lang: 'latin' as Lang, start: true }
const o = reactive({ ...DEFAULTS })
const text = ref('')
const run = () => (text.value = generateLorem(o.unit, Number(o.count), o.lang, o.start))
watch(o, run, { immediate: true })
function loadSample() {
  o.unit = DEFAULTS.unit
  o.count = DEFAULTS.count
  o.lang = DEFAULTS.lang
  o.start = DEFAULTS.start
  run()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <ModeToggle v-model="o.unit" :options="[['paragraphs', $t('tools.lorem-ipsum.paragraphs')], ['sentences', $t('tools.lorem-ipsum.sentences')], ['words', $t('tools.lorem-ipsum.words')]]" />
      <Label for="lc">{{ $t('tools.lorem-ipsum.count') }}</Label>
      <Input id="lc" v-model.number="o.count" type="number" min="1" max="500" class="w-24" />
      <ModeToggle v-model="o.lang" :options="[['latin', $t('tools.lorem-ipsum.latin')], ['chinese', $t('tools.lorem-ipsum.chinese')]]" />
      <Label v-if="o.lang === 'latin'"><Switch v-model="o.start" /> {{ $t('tools.lorem-ipsum.startWithLorem') }}</Label>
      <div class="ml-auto flex gap-2">
        <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
        <Button size="sm" variant="outline" @click="run"><RefreshCw /> {{ $t('common.generate') }}</Button>
        <CopyButton :text="text" />
      </div>
    </div>
    <Textarea :model-value="text" readonly class="min-h-[500px] font-sans min-h-[500px] h-[500px]" />
  </div>
</template>
