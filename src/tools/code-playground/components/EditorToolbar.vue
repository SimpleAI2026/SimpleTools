<script setup lang="ts">
import { computed, ref } from 'vue'
import { CircleHelp, RotateCcw, Square, Trash2, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/tools/code-playground/components/ui/tooltip'
import QuickStartButton from './QuickStartButton.vue'
import RunButton from './RunButton.vue'
import AboutDialog from './AboutDialog.vue'
import { useLanguageStore } from '@/tools/code-playground/stores/language'
import { useRunStore } from '@/tools/code-playground/stores/run'
import { fileNameFor, useEditorStore } from '@/tools/code-playground/stores/editor'
import { runtimeName, t } from '@/tools/code-playground/i18n'
import { formatMB } from '@/tools/code-playground/core/manifest'

const langs = useLanguageStore()
const run = useRunStore()
const editor = useEditorStore()
const aboutOpen = ref(false)
const isMac = navigator.platform.toLowerCase().includes('mac')
const mod = isMac ? '⌘' : 'Ctrl'

const downloading = computed(() => langs.selectedState?.status === 'downloading')
const ready = computed(() => ['ready', 'cached'].includes(langs.selectedState?.status ?? ''))
const fileName = computed(() => {
  const lang = langs.selected
  return lang ? fileNameFor(lang.id, lang.fileName, editor.dialect) : ''
})
const languageName = computed(() => {
  const lang = langs.selected
  if (!lang) return ''
  return lang.id === 'quickjs' ? (editor.dialect === 'ts' ? 'TypeScript' : 'JavaScript') : runtimeName(lang.id, lang.label)
})
const cacheText = computed(() => formatMB(langs.usage))

function reset() {
  if (langs.selected && confirm(t('resetConfirm', { name: languageName.value }))) {
    editor.reset(editor.activeBuffer(langs.selected.id))
  }
}
async function clearCache() {
  if (confirm(t('clearCacheConfirm'))) await langs.clearCache()
}
</script>

<template>
  <div class="flex min-h-[var(--editor-toolbar-h)] shrink-0 flex-wrap items-center gap-1 border-b border-border px-2 py-1 sm:px-3" data-testid="editor-toolbar">
    <div class="flex min-w-28 flex-1 items-center gap-2 overflow-hidden">
      <span class="shrink-0 text-xs font-medium">{{ languageName }}</span>
      <span class="truncate font-mono text-xs text-muted-foreground" data-testid="filename">{{ fileName }}</span>
    </div>
    <QuickStartButton />
    <Button v-if="downloading && langs.selected" variant="ghost" size="xs" class="max-md:h-11" @click="langs.cancel(langs.selected.id)"><X />{{ t('cancelDownload') }}</Button>
    <Tooltip>
      <TooltipTrigger as-child>
        <span><RunButton test-id="run" :disabled="!langs.selected || run.running || downloading" :running="run.running" :status="run.status" @click="run.run()" /></span>
      </TooltipTrigger>
      <TooltipContent side="bottom">{{ ready || downloading ? t('runShortcut', { mod }) : t('runWillDownload') }}</TooltipContent>
    </Tooltip>
    <Button v-if="run.running" variant="ghost-destructive" size="xs" class="max-md:h-11 max-md:px-4" data-testid="stop" @click="run.stop()"><Square />Stop</Button>
    <Tooltip>
      <TooltipTrigger as-child><Button variant="ghost" size="icon" class="size-7 max-md:size-11" :aria-label="t('resetSample')" @click="reset"><RotateCcw /></Button></TooltipTrigger>
      <TooltipContent side="bottom">{{ t('resetSample') }}</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="xs" class="max-md:h-11" :disabled="!langs.usage" :aria-label="t('clearCache')" data-testid="toolbar-clear-cache" @click="clearCache"><Trash2 /><span class="hidden lg:inline">{{ cacheText }}</span></Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{{ t('clearCacheTip', { size: cacheText }) }}</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child><Button variant="ghost" size="icon" class="size-7 max-md:size-11" :aria-label="t('about')" data-testid="about-button" @click="aboutOpen = true"><CircleHelp /></Button></TooltipTrigger>
      <TooltipContent side="bottom">{{ t('about') }}</TooltipContent>
    </Tooltip>
    <AboutDialog v-model:open="aboutOpen" />
  </div>
</template>
