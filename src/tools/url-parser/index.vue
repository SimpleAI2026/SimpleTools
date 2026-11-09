<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { parseUrl, withParams } from './logic'

const SAMPLE = 'https://user@example.com:8080/docs/page?lang=zh&q=vue%203#intro'
const input = ref(SAMPLE)
const parsed = computed(() => parseUrl(input.value))
const params = ref<[string, string][]>([])
watch(parsed, (p) => (params.value = p ? p.params.map(([k, v]) => [k, v]) : []), { immediate: true })
const rebuilt = computed(() => (parsed.value ? withParams(parsed.value.href, params.value) : ''))
const fields = ['protocol', 'username', 'password', 'hostname', 'port', 'pathname', 'search', 'hash', 'origin'] as const

function loadSample() {
  input.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <Input v-model="input" class="font-mono" :placeholder="$t('tools.url-parser.input')" />
    <ErrorAlert v-if="!parsed" :message="$t('tools.url-parser.invalid')" />
    <template v-else>
      <div class="grid gap-x-6 sm:grid-cols-2">
        <div v-for="f in fields" :key="f" class="flex items-center gap-2 border-b py-1.5 text-sm">
          <span class="text-muted-foreground w-20">{{ $t(`tools.url-parser.fields.${f}`) }}</span>
          <code class="flex-1 font-mono break-all">{{ parsed[f] || '—' }}</code>
          <CopyButton v-if="parsed[f]" :text="parsed[f]" :label="false" />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <h3 class="text-sm font-medium">{{ $t('tools.url-parser.params') }}</h3>
        <div v-for="(p, i) in params" :key="i" class="flex gap-2">
          <Input v-model="p[0]" :placeholder="$t('tools.url-parser.key')" class="font-mono" />
          <Input v-model="p[1]" :placeholder="$t('tools.url-parser.value')" class="font-mono" />
          <Button size="icon" variant="ghost" :aria-label="$t('common.remove')" @click="params.splice(i, 1)"><Trash2 /></Button>
        </div>
        <div><Button size="sm" variant="outline" @click="params.push(['', ''])"><Plus /> {{ $t('common.add') }}</Button></div>
      </div>
      <div class="flex items-center gap-2 rounded-md border p-3">
        <span class="text-muted-foreground text-sm">{{ $t('tools.url-parser.rebuilt') }}</span>
        <code class="flex-1 font-mono text-sm break-all">{{ rebuilt }}</code>
        <CopyButton :text="rebuilt" :label="false" />
      </div>
    </template>
  </div>
</template>
