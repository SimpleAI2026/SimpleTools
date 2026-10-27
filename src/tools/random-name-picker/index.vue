<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { makeTeams, parseNames, pickNames } from './logic'

const SAMPLE = '张三\n李四\n王五\nAlice\nBob\nCarol'
const text = ref(SAMPLE)
const names = computed(() => parseNames(text.value))
const mode = ref<'pick' | 'teams'>('pick')
const count = ref(1)
const groups = ref(2)
const remove = ref(false)
const winners = ref<string[]>([])
const teams = ref<string[][]>([])
function loadSample() {
  text.value = SAMPLE
  winners.value = []
  teams.value = []
}
function run() {
  if (mode.value === 'pick') {
    winners.value = pickNames(names.value, Number(count.value) || 1)
    if (remove.value) text.value = names.value.filter((n) => !winners.value.includes(n)).join('\n')
  } else teams.value = makeTeams(names.value, Number(groups.value) || 2)
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <Label>{{ $t('tools.random-name-picker.names') }}</Label>
        <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
      </div>
      <Textarea v-model="text" class="min-h-[500px] font-sans min-h-[500px] h-[500px]" />
      <p class="text-muted-foreground text-xs">{{ $t('tools.random-name-picker.total', { n: names.length }) }}</p>
    </div>
    <div class="flex flex-col gap-4">
      <ModeToggle v-model="mode" :options="[['pick', $t('tools.random-name-picker.pick')], ['teams', $t('tools.random-name-picker.teams')]]" />
      <div class="flex flex-wrap items-end gap-3">
        <template v-if="mode === 'pick'">
          <div class="flex flex-col gap-2"><Label for="pc">{{ $t('tools.random-name-picker.count') }}</Label><Input id="pc" v-model.number="count" type="number" min="1" class="w-24" /></div>
          <Label><Switch v-model="remove" /> {{ $t('tools.random-name-picker.removeWinners') }}</Label>
        </template>
        <div v-else class="flex flex-col gap-2"><Label for="gc">{{ $t('tools.random-name-picker.groups') }}</Label><Input id="gc" v-model.number="groups" type="number" min="1" class="w-24" /></div>
        <Button :disabled="!names.length" @click="run">{{ mode === 'pick' ? $t('tools.random-name-picker.pick') : $t('tools.random-name-picker.teams') }}</Button>
      </div>
      <div v-if="mode === 'pick' && winners.length" class="flex flex-wrap gap-2">
        <span v-for="w in winners" :key="w" class="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xl font-semibold">{{ w }}</span>
      </div>
      <div v-if="mode === 'teams' && teams.length" class="grid gap-3 sm:grid-cols-2">
        <div v-for="(t, i) in teams" :key="i" class="rounded-md border p-3">
          <div class="mb-1 text-sm font-medium">{{ $t('tools.random-name-picker.group', { n: i + 1 }) }}</div>
          <div class="text-sm">{{ t.join('、') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
