<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { activeSets, entropyBits, generatePassword, strengthOf, type PasswordOptions } from './logic'

const opts = reactive<PasswordOptions>({ length: 20, lower: true, upper: true, digits: true, symbols: true, excludeSimilar: false })
const lengthModel = computed({ get: () => [opts.length], set: (v: number[]) => (opts.length = v[0] ?? 20) })
const password = ref('')
const noCharset = computed(() => activeSets(opts).length === 0)
const bits = computed(() => entropyBits(opts))
const strength = computed(() => strengthOf(bits.value))
const barColor = { weak: 'bg-red-500', fair: 'bg-amber-500', strong: 'bg-emerald-500', veryStrong: 'bg-emerald-600' }

function regenerate() {
  password.value = noCharset.value ? '' : generatePassword(opts)
}
watch(opts, regenerate, { immediate: true })
const toggles = ['lower', 'upper', 'digits', 'symbols', 'excludeSimilar'] as const
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center gap-2 rounded-lg border p-3">
      <code class="min-w-0 flex-1 font-mono text-lg break-all" data-testid="password">{{ password || '—' }}</code>
      <Button variant="outline" size="icon" :aria-label="$t('common.generate')" :disabled="noCharset" @click="regenerate"><RefreshCw /></Button>
      <CopyButton :text="password" />
    </div>
    <ErrorAlert v-if="noCharset" :message="$t('tools.password-generator.noCharset')" />
    <div v-else class="flex flex-col gap-2">
      <div class="flex justify-between text-sm">
        <span>{{ $t('tools.password-generator.strength') }}: {{ $t(`tools.password-generator.${strength}`) }}</span>
        <span class="text-muted-foreground">{{ $t('tools.password-generator.bits', { n: bits }) }}</span>
      </div>
      <div class="bg-muted h-2 overflow-hidden rounded-full">
        <div :class="['h-full transition-all', barColor[strength]]" :style="{ width: `${Math.min(100, bits / 1.28)}%` }"></div>
      </div>
    </div>
    <div class="flex flex-col gap-3">
      <Label>{{ $t('tools.password-generator.length') }}: {{ opts.length }}</Label>
      <Slider v-model="lengthModel" :min="4" :max="128" />
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <Label v-for="k in toggles" :key="k"><Switch v-model="opts[k]" /> {{ $t(`tools.password-generator.${k}`) }}</Label>
    </div>
  </div>
</template>
