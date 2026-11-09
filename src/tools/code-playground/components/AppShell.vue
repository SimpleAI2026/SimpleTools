<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import MainArea from './MainArea.vue'
import DocsDrawer from './docs/DocsDrawer.vue'
import { useDocsStore } from '../stores/docs'
import { useRunFromDoc } from '../composables/useRunFromDoc'
import { useLanguageStore } from '../stores/language'
import { t } from '../i18n'

const langs = useLanguageStore()
const docs = useDocsStore()
const learn = useRunFromDoc()

function onKey(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
    event.preventDefault()
    docs.toggle()
    return
  }
  if (!docs.open) return
  const target = event.target as HTMLElement | null
  const inDrawer = !!target?.closest("[data-testid='docs-drawer']")
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z' && !event.shiftKey && inDrawer) {
    event.preventDefault()
    learn.undoLastReplace()
    return
  }
  if (!inDrawer || target?.closest("input, textarea, [contenteditable='true']")) return
  if (event.key === '[') {
    event.preventDefault()
    docs.prev()
  } else if (event.key === ']') {
    event.preventDefault()
    docs.next()
  }
}

onMounted(() => window.addEventListener('keydown', onKey, true))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey, true))
</script>

<template>
  <div class="flex h-full min-h-0 flex-col" data-testid="single-language-workbench">
    <div v-if="langs.manifestError" role="alert" class="flex flex-wrap items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      <span class="min-w-0 flex-1 break-words">{{ langs.manifestError }}</span>
      <button type="button" class="shrink-0 underline underline-offset-2" @click="langs.init()">{{ t('retry') }}</button>
    </div>
    <MainArea class="min-h-0 flex-1" />
    <DocsDrawer />
  </div>
</template>
