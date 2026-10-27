<script setup lang="ts">
import { computed } from 'vue'

/** Spreadsheet-like preview of a string grid; renders at most `limit` rows. */
const props = withDefaults(defineProps<{ rows: string[][]; limit?: number; header?: boolean }>(), { limit: 500, header: true })
const shown = computed(() => props.rows.slice(0, props.limit))
const cols = computed(() => Math.max(0, ...shown.value.map((r) => r.length)))
const colName = (i: number) => {
  let s = ''
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  return s
}
</script>

<template>
  <div class="max-h-[32rem] overflow-auto rounded-md border">
    <table class="w-max min-w-full border-collapse text-sm">
      <thead class="bg-muted sticky top-0 z-10">
        <tr>
          <th class="text-muted-foreground w-10 border px-2 py-1 text-xs font-normal">#</th>
          <th v-for="c in cols" :key="c" class="text-muted-foreground border px-2 py-1 text-xs font-normal">{{ colName(c - 1) }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in shown" :key="i" :class="header && i === 0 ? 'bg-muted/50 font-semibold' : ''">
          <td class="text-muted-foreground border px-2 py-1 text-right text-xs">{{ i + 1 }}</td>
          <td v-for="c in cols" :key="c" class="max-w-80 truncate border px-2 py-1" :title="r[c - 1]">{{ r[c - 1] }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="rows.length > limit" class="text-muted-foreground p-2 text-xs">… {{ rows.length - limit }} more rows</div>
  </div>
</template>
