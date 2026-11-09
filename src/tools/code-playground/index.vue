<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { programmingRoute } from '@/registry/tools/programming'
import { TooltipProvider } from './components/ui/tooltip'
import AppShell from './components/AppShell.vue'
import IsolationGuard from './components/IsolationGuard.vue'
import ToastHost from './components/docs/ToastHost.vue'
import { useLanguageStore } from './stores/language'
import { useEditorStore } from './stores/editor'
import { useRunStore } from './stores/run'
import { ensureCrossOriginIsolation } from './core/coi'
import './style.css'

const route = useRoute()
const isolated = ref(typeof window !== 'undefined' && window.crossOriginIsolated === true)
const checking = ref(true)
const langs = useLanguageStore()
const editor = useEditorStore()
const run = useRunStore()

onMounted(async () => {
  const definition = programmingRoute(route.params.slug)
  if (!definition) {
    checking.value = false
    return
  }
  if (definition.dialect) editor.dialect = definition.dialect
  langs.selectedId = definition.runtime
  await ensureCrossOriginIsolation()
  isolated.value = window.crossOriginIsolated === true
  checking.value = false
  if (isolated.value) void langs.init(definition.runtime)
})

onBeforeUnmount(() => {
  run.abandon()
  editor.flush()
  langs.dispose()
})
</script>

<template>
  <TooltipProvider :delay-duration="300">
    <div class="code-playground h-full min-h-0" :data-runtime="langs.selectedId">
      <AppShell v-if="isolated" />
      <IsolationGuard v-else-if="!checking" />
      <p v-else class="text-muted-foreground p-6 text-sm">{{ $t('app.loading') }}</p>
      <ToastHost />
    </div>
  </TooltipProvider>
</template>
