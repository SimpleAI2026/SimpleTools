<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { Download, Plus, Trash2, Upload } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { downloadText } from '@/lib/download'
import { countText } from '@/tools/word-counter/logic'
import { displayTitle, newNote, noteFilename, sanitizeNotes, sortNotes, type Note } from './logic'

const { t } = useI18n()
const stored = useLocalStorage<Note[]>('st_notepad', [])
if (sanitizeNotes(stored.value).length === 0) stored.value = [newNote()]
const notes = computed(() => sortNotes(sanitizeNotes(stored.value)))
const activeId = ref(notes.value[0]?.id ?? '')
const active = computed(() => stored.value.find((n) => n.id === activeId.value))

function update(patch: Partial<Note>) {
  stored.value = stored.value.map((n) => (n.id === activeId.value ? { ...n, ...patch, updatedAt: Date.now() } : n))
}
function create(body = '', title = '') {
  const n = { ...newNote(), body, title }
  stored.value = [n, ...stored.value]
  activeId.value = n.id
}
const SAMPLE_BODY = '# SimpleTools Sample\n\nOffline-first developer toolbox.\n\n- Pure front-end\n- Bilingual zh/en\n'
function loadSample() {
  if (active.value && !active.value.body.trim()) {
    update({ title: active.value.title || 'Sample', body: SAMPLE_BODY })
    return
  }
  create(SAMPLE_BODY, 'Sample')
}
function remove() {
  if (!confirm(t('tools.notepad.confirmDelete'))) return
  stored.value = stored.value.filter((n) => n.id !== activeId.value)
  if (stored.value.length === 0) stored.value = [newNote()]
  activeId.value = notes.value[0]?.id ?? ''
}
const fileInput = ref<HTMLInputElement | null>(null)
async function onImport(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) create(await f.text(), f.name.replace(/\.[^.]+$/, ''))
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="grid gap-4 md:grid-cols-[14rem_1fr]">
    <aside class="flex flex-col gap-2">
      <div class="flex gap-2">
        <Button size="sm" class="flex-1" @click="create()"><Plus /> {{ $t('tools.notepad.new') }}</Button>
        <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
        <Button size="sm" variant="outline" :aria-label="$t('tools.notepad.import')" @click="fileInput?.click()"><Upload /></Button>
        <input ref="fileInput" type="file" accept=".txt,.md,text/*" class="hidden" @change="onImport" />
      </div>
      <button
        v-for="n in notes"
        :key="n.id"
        type="button"
        :class="['truncate rounded-md px-3 py-2 text-left text-sm', n.id === activeId ? 'bg-secondary font-medium' : 'hover:bg-accent']"
        @click="activeId = n.id"
      >
        {{ displayTitle(n, $t('tools.notepad.untitled')) }}
      </button>
    </aside>
    <section v-if="active" class="flex flex-col gap-2">
      <div class="flex gap-2">
        <Input :model-value="active.title" :placeholder="$t('tools.notepad.title')" @update:model-value="update({ title: String($event) })" />
        <Button size="sm" variant="outline" @click="downloadText(active.body, noteFilename(active))"><Download /> {{ $t('tools.notepad.export') }}</Button>
        <Button size="sm" variant="outline" :aria-label="$t('tools.notepad.delete')" @click="remove"><Trash2 /></Button>
      </div>
      <Textarea :model-value="active.body" class="min-h-[500px] font-sans text-base min-h-[500px] h-[500px]" :placeholder="$t('tools.notepad.placeholder')" @update:model-value="update({ body: String($event) })" />
      <p class="text-muted-foreground text-xs">
        {{ $t('tools.notepad.words', { n: countText(active.body).words }) }} · {{ $t('tools.notepad.saved') }} {{ new Date(active.updatedAt).toLocaleTimeString() }}
      </p>
    </section>
  </div>
</template>
