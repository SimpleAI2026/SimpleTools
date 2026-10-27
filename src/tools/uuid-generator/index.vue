<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Download, RefreshCw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import { downloadText } from '@/lib/download'
import { generateUuids, MAX_UUID_COUNT, type UuidOptions } from './logic'

const count = ref(5)
const opts = reactive<UuidOptions>({ uppercase: false, hyphens: true, braces: false })
const list = ref<string[]>([])
const text = computed(() => list.value.join('\n'))
function regenerate() {
  list.value = generateUuids(count.value, opts)
}
watch([count, opts], regenerate, { immediate: true })
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-end gap-4">
      <div class="flex flex-col gap-2">
        <Label for="uuid-count">{{ $t('tools.uuid-generator.count') }}</Label>
        <Input id="uuid-count" v-model.number="count" type="number" min="1" :max="MAX_UUID_COUNT" class="w-28" />
      </div>
      <Label><Switch v-model="opts.uppercase" /> {{ $t('tools.uuid-generator.uppercase') }}</Label>
      <Label><Switch v-model="opts.hyphens" /> {{ $t('tools.uuid-generator.hyphens') }}</Label>
      <Label><Switch v-model="opts.braces" /> {{ $t('tools.uuid-generator.braces') }}</Label>
      <div class="ml-auto flex gap-2">
        <Button size="sm" variant="outline" @click="regenerate"><RefreshCw /> {{ $t('common.generate') }}</Button>
        <CopyButton :text="text" />
        <Button size="sm" variant="outline" @click="downloadText(text, 'uuids.txt')"><Download /> {{ $t('common.download') }}</Button>
      </div>
    </div>
    <Textarea :model-value="text" readonly class="bg-muted/40 min-h-[500px] min-h-[500px] h-[500px]" />
  </div>
</template>
