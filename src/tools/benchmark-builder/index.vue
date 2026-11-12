<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import { formatStat, parseNumbers, summarize } from './logic'

const groups = ref([{ name: 'A', text: '12, 14, 13, 15' }, { name: 'B', text: '20, 18, 22' }])
const rows = computed(() => groups.value.map((group) => ({ name: group.name, stats: summarize(parseNumbers(group.text)) })))
const text = computed(() =>
  rows.value
    .filter((row) => row.stats)
    .map((row) => {
      const stats = row.stats
      if (!stats) return ''
      return `${row.name}\tn=${stats.count}\tmin=${formatStat(stats.min)}\tmax=${formatStat(stats.max)}\tmean=${formatStat(stats.mean)}\tmedian=${formatStat(stats.median)}\tstdev=${formatStat(stats.stdev)}`
    })
    .join('\n'),
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-for="(group, index) in groups" :key="index" class="grid gap-2 sm:grid-cols-[8rem_1fr_auto]">
      <Input v-model="group.name" />
      <Textarea v-model="group.text" class="min-h-20 font-mono text-xs" />
      <Button variant="ghost" :disabled="groups.length === 1" @click="groups.splice(index, 1)">{{ $t('common.remove') }}</Button>
    </div>
    <Button variant="outline" @click="groups.push({ name: String.fromCharCode(65 + groups.length), text: '' })">{{ $t('tools.benchmark-builder.add') }}</Button>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="text" /></div>
      <div class="overflow-x-auto rounded-md border" data-testid="tool-output">
        <table class="w-full text-sm">
          <thead class="bg-muted/50 text-left"><tr><th class="p-2">{{ $t('tools.benchmark-builder.group') }}</th><th class="p-2">n</th><th class="p-2">min</th><th class="p-2">max</th><th class="p-2">{{ $t('tools.benchmark-builder.mean') }}</th><th class="p-2">{{ $t('tools.benchmark-builder.median') }}</th><th class="p-2">{{ $t('tools.benchmark-builder.stdev') }}</th></tr></thead>
          <tbody>
            <tr v-for="row in rows" :key="row.name" class="border-t">
              <td class="p-2">{{ row.name }}</td>
              <template v-if="row.stats"><td class="p-2 font-mono">{{ row.stats.count }}</td><td class="p-2 font-mono">{{ formatStat(row.stats.min) }}</td><td class="p-2 font-mono">{{ formatStat(row.stats.max) }}</td><td class="p-2 font-mono">{{ formatStat(row.stats.mean) }}</td><td class="p-2 font-mono">{{ formatStat(row.stats.median) }}</td><td class="p-2 font-mono">{{ formatStat(row.stats.stdev) }}</td></template>
              <td v-else colspan="6" class="text-muted-foreground p-2">{{ $t('tools.benchmark-builder.empty') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
