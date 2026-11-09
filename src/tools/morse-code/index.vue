<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Play, Square } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import TextIO from '@/components/shared/TextIO.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { fromMorse, toMorse } from './logic'

const { t } = useI18n()
const mode = ref<'enc' | 'dec'>('enc')
const SAMPLE = 'SOS Hello'
const input = ref(SAMPLE)
const res = computed(() => {
  if (mode.value === 'dec') return { out: fromMorse(input.value), err: '' }
  const r = toMorse(input.value)
  return { out: r.output, err: r.unknown.length ? t('tools.morse-code.unknown', { chars: r.unknown.join(' ') }) : '' }
})
const code = computed(() => (mode.value === 'enc' ? res.value.out : input.value))

let ctx: AudioContext | null = null
const playing = ref(false)
function stop() {
  void ctx?.close()
  ctx = null
  playing.value = false
}
function play() {
  stop()
  ctx = new AudioContext()
  const unit = 0.08
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = 600
  gain.gain.value = 0
  osc.connect(gain).connect(ctx.destination)
  let at = ctx.currentTime + 0.05
  for (const ch of code.value) {
    if (ch === '.' || ch === '-') {
      gain.gain.setValueAtTime(0.4, at)
      at += unit * (ch === '.' ? 1 : 3)
      gain.gain.setValueAtTime(0, at)
      at += unit
    } else if (ch === ' ') at += unit * 2
    else if (ch === '/') at += unit * 2
  }
  osc.start()
  osc.stop(at)
  playing.value = true
  osc.onended = stop
}
onBeforeUnmount(stop)
</script>

<template>
  <TextIO v-model="input" :output="res.out" :error="res.err" :sample="SAMPLE">
    <ModeToggle v-model="mode" :options="[['enc', $t('tools.morse-code.toMorse')], ['dec', $t('tools.morse-code.toText')]]" />
    <Button size="sm" variant="outline" :disabled="!code.trim()" @click="playing ? stop() : play()">
      <Square v-if="playing" /><Play v-else /> {{ playing ? $t('tools.morse-code.stop') : $t('tools.morse-code.play') }}
    </Button>
  </TextIO>
</template>
