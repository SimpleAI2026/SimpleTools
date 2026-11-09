<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { DICE_SIDES, flipCoins, parseNotation, rollDice, summarize, type Coin } from './logic'

const mode = ref<'coin' | 'dice'>('coin')
const coinCount = ref(1)
const coins = ref<Coin[]>([])
const notation = ref('2d6')
const dice = ref<number[]>([])
const modifier = ref(0)
const history = ref<string[]>([])
const parsed = computed(() => parseNotation(notation.value))

function flip() {
  coins.value = flipCoins(Number(coinCount.value) || 1)
  const h = coins.value.filter((c) => c === 'heads').length
  history.value = [`🪙 ${h}H / ${coins.value.length - h}T`, ...history.value].slice(0, 20)
}
function roll() {
  if (!parsed.value) return
  dice.value = rollDice(parsed.value.count, parsed.value.sides)
  modifier.value = parsed.value.modifier
  history.value = [`🎲 ${notation.value}: [${dice.value.join(', ')}] = ${summarize(dice.value).total + modifier.value}`, ...history.value].slice(0, 20)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <ModeToggle v-model="mode" :options="[['coin', $t('tools.coin-dice-roller.coin')], ['dice', $t('tools.coin-dice-roller.dice')]]" />
    <div v-if="mode === 'coin'" class="flex flex-col gap-4">
      <div class="flex items-end gap-3">
        <div class="flex flex-col gap-2"><Label for="cc">{{ $t('tools.coin-dice-roller.count') }}</Label><Input id="cc" v-model.number="coinCount" type="number" min="1" max="100" class="w-24" /></div>
        <Button @click="flip">{{ $t('tools.coin-dice-roller.flip') }}</Button>
      </div>
      <div class="flex flex-wrap gap-3">
        <div v-for="(c, i) in coins" :key="i" :class="['flex size-20 items-center justify-center rounded-full border-4 text-sm font-semibold', c === 'heads' ? 'border-amber-400 bg-amber-100 text-amber-900' : 'border-slate-400 bg-slate-100 text-slate-800']">
          {{ $t(`tools.coin-dice-roller.${c}`) }}
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2">
        <Button v-for="s in DICE_SIDES" :key="s" size="sm" variant="outline" @click="notation = `${parsed?.count ?? 1}d${s}`">d{{ s }}</Button>
      </div>
      <div class="flex items-end gap-3">
        <div class="flex flex-col gap-2"><Label for="nt">{{ $t('tools.coin-dice-roller.notation') }}</Label><Input id="nt" v-model="notation" class="w-48 font-mono" /></div>
        <Button :disabled="!parsed" @click="roll">{{ $t('tools.coin-dice-roller.roll') }}</Button>
      </div>
      <ErrorAlert v-if="!parsed" :message="$t('tools.coin-dice-roller.invalidNotation')" />
      <div v-if="dice.length" class="flex flex-wrap items-center gap-3">
        <div v-for="(d, i) in dice" :key="i" class="bg-card flex size-14 items-center justify-center rounded-lg border-2 text-xl font-bold shadow-sm">{{ d }}</div>
        <span class="text-lg">{{ $t('tools.coin-dice-roller.total') }}: <b>{{ summarize(dice).total + modifier }}</b><span v-if="modifier" class="text-muted-foreground text-sm"> ({{ modifier > 0 ? '+' : '' }}{{ modifier }})</span></span>
      </div>
    </div>
    <div v-if="history.length" class="flex flex-col gap-1">
      <h3 class="text-sm font-medium">{{ $t('tools.coin-dice-roller.history') }}</h3>
      <p v-for="(h, i) in history" :key="i" class="text-muted-foreground font-mono text-xs">{{ h }}</p>
    </div>
  </div>
</template>
