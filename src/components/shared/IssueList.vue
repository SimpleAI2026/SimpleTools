<script setup lang="ts">
export interface AuditIssue {
  row?: number
  id?: string
  url?: string
  from?: string
  code: string
  detail: string
}

defineProps<{ issues: AuditIssue[] }>()
const subject = (issue: AuditIssue) => issue.url || issue.from || issue.id || '—'
</script>

<template>
  <section class="flex flex-col gap-2" aria-live="polite">
    <h3 class="text-sm font-medium">{{ $t('common.issues') }} <span class="text-muted-foreground">({{ issues.length }})</span></h3>
    <p v-if="!issues.length" class="rounded-md border border-emerald-600/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400" data-testid="no-issues">
      {{ $t('common.noIssues') }}
    </p>
    <div v-else class="overflow-x-auto rounded-md border">
      <table class="w-full min-w-[36rem] border-collapse text-sm">
        <thead class="bg-muted/60 text-left">
          <tr>
            <th class="px-3 py-2 font-medium">{{ $t('common.row') }}</th>
            <th class="px-3 py-2 font-medium">URL / ID</th>
            <th class="px-3 py-2 font-medium">{{ $t('common.problem') }}</th>
            <th class="px-3 py-2 font-medium">{{ $t('common.details') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(issue, index) in issues" :key="`${issue.code}-${issue.detail}-${index}`" class="border-t align-top">
            <td class="px-3 py-2 text-muted-foreground">{{ issue.row || '—' }}</td>
            <td class="max-w-48 break-all px-3 py-2 font-mono text-xs">{{ subject(issue) }}</td>
            <td class="px-3 py-2 font-mono text-xs text-amber-700 dark:text-amber-400">{{ issue.code }}</td>
            <td class="max-w-md break-all px-3 py-2">{{ issue.detail }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
