<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { addLap, formatLaps, formatStopwatch, type Lap } from './logic'

const running = ref(false)
const startedAt = ref(0)
const accumulated = ref(0)
const now = ref(0)
const laps = ref<Lap[]>([])
let timer = 0

const elapsed = computed(() => accumulated.value + (running.value ? now.value - startedAt.value : 0))
const text = computed(() => [`${formatStopwatch(elapsed.value)}`, formatLaps(laps.value)].filter(Boolean).join('\n'))

function tick() {
  now.value = performance.now()
}
function start() {
  if (running.value) return
  startedAt.value = performance.now()
  now.value = startedAt.value
  running.value = true
  timer = window.setInterval(tick, 30)
}
function stop() {
  if (!running.value) return
  accumulated.value = elapsed.value
  running.value = false
  window.clearInterval(timer)
}
function reset() {
  stop()
  accumulated.value = 0
  laps.value = []
}
function lap() {
  if (!running.value && accumulated.value === 0) return
  laps.value = addLap(laps.value, elapsed.value)
}
onUnmounted(() => window.clearInterval(timer))
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="font-mono text-5xl tabular-nums" data-testid="stopwatch-time">{{ formatStopwatch(elapsed) }}</p>
    <div class="flex flex-wrap gap-2">
      <Button v-if="!running" @click="start">{{ $t('tools.stopwatch.start') }}</Button>
      <Button v-else variant="secondary" @click="stop">{{ $t('tools.stopwatch.stop') }}</Button>
      <Button variant="outline" @click="lap">{{ $t('tools.stopwatch.lap') }}</Button>
      <Button variant="ghost" @click="reset">{{ $t('tools.stopwatch.reset') }}</Button>
    </div>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('tools.stopwatch.laps') }}</Label><CopyButton :text="text" /></div>
      <ol class="flex flex-col gap-1 text-sm">
        <li v-for="item in laps" :key="item.index" class="flex justify-between gap-3 font-mono">
          <span>#{{ item.index }}</span><span>{{ formatStopwatch(item.splitMs) }}</span><span>{{ formatStopwatch(item.totalMs) }}</span>
        </li>
      </ol>
    </section>
  </div>
</template>
