<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import CopyButton from '@/components/shared/CopyButton.vue'
import { Button } from '@/components/ui/button'
import { fromOctal, fromSymbolic, toOctal, toSymbolic, WHO, type PermMatrix, type Special } from './logic'

const init = fromOctal('755')!
const matrix = reactive<PermMatrix>(init.matrix)
const special = reactive<Special>(init.special)
const octal = computed(() => toOctal(matrix, special))
const symbolic = computed(() => toSymbolic(matrix, special))
const octInput = ref('')
const symInput = ref('')
const bad = ref(false)
function loadSample() {
  apply(fromOctal('755'))
  octInput.value = '755'
  symInput.value = ''
}
function apply(r: ReturnType<typeof fromOctal>) {
  bad.value = !r
  if (!r) return
  Object.assign(matrix, r.matrix)
  Object.assign(special, r.special)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full max-w-lg text-sm">
        <thead><tr><th></th><th v-for="p in ['r', 'w', 'x'] as const" :key="p" class="px-3 py-2">{{ $t(`tools.chmod-calculator.${p}`) }}</th></tr></thead>
        <tbody>
          <tr v-for="w in WHO" :key="w" class="border-t">
            <td class="py-2 font-medium">{{ $t(`tools.chmod-calculator.${w}`) }}</td>
            <td v-for="p in ['r', 'w', 'x'] as const" :key="p" class="px-3 py-2 text-center"><input v-model="matrix[w][p]" type="checkbox" class="size-4" :aria-label="`${w} ${p}`" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex flex-wrap gap-4">
      <span class="text-sm font-medium">{{ $t('tools.chmod-calculator.special') }}</span>
      <Label v-for="k in ['setuid', 'setgid', 'sticky'] as const" :key="k"><Switch v-model="special[k]" /> {{ k }}</Label>
    </div>
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-lg border p-3"><div class="text-muted-foreground text-xs">{{ $t('tools.chmod-calculator.octal') }}</div><div class="flex items-center justify-between font-mono text-2xl">{{ octal }}<CopyButton :text="octal" :label="false" /></div></div>
      <div class="rounded-lg border p-3"><div class="text-muted-foreground text-xs">{{ $t('tools.chmod-calculator.symbolic') }}</div><div class="flex items-center justify-between font-mono text-2xl">{{ symbolic }}<CopyButton :text="symbolic" :label="false" /></div></div>
      <div class="rounded-lg border p-3"><div class="text-muted-foreground text-xs">{{ $t('tools.chmod-calculator.command') }}</div><div class="flex items-center justify-between font-mono text-lg">chmod {{ octal }} file<CopyButton :text="`chmod ${octal} file`" :label="false" /></div></div>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <Input v-model="octInput" class="font-mono" :placeholder="`${$t('tools.chmod-calculator.octal')}: 644`" @change="apply(fromOctal(octInput))" />
      <Input v-model="symInput" class="font-mono" :placeholder="`${$t('tools.chmod-calculator.symbolic')}: rw-r--r--`" @change="apply(fromSymbolic(symInput))" />
    </div>
    <p v-if="bad" class="text-destructive text-sm">{{ $t('tools.chmod-calculator.invalid') }}</p>
  </div>
</template>
