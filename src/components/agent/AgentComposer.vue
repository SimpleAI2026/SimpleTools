<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ArrowUp, Plus, Square, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAgentStore } from '@/stores/agent'
import {
  DEFAULT_ACCEPT,
  DEFAULT_MAX_ATTACHMENT_BYTES,
  DEFAULT_MAX_ATTACHMENTS,
  createPendingId,
  fileToDataUrl,
  formatBytes,
  isImageFile,
  type PendingAttachment,
  type SendAttachment,
} from '@/agent'

const agent = useAgentStore()
const draft = ref('')
const pending = ref<PendingAttachment[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

const canSend = computed(
  () =>
    (draft.value.trim().length > 0 || pending.value.length > 0) && !agent.streaming,
)

function openFilePicker() {
  if (agent.streaming) return
  fileInput.value?.click()
}

function revokeAll() {
  for (const a of pending.value) {
    try {
      URL.revokeObjectURL(a.previewUrl)
    } catch {
      /* ignore */
    }
  }
}

function clearPending() {
  revokeAll()
  pending.value = []
}

function removePending(id: string) {
  const idx = pending.value.findIndex((a) => a.id === id)
  if (idx < 0) return
  const [removed] = pending.value.splice(idx, 1)
  try {
    URL.revokeObjectURL(removed!.previewUrl)
  } catch {
    /* ignore */
  }
}

function addFiles(files: File[]) {
  if (!files.length || agent.streaming) return
  let err: string | null = null
  for (const file of files) {
    if (pending.value.length >= DEFAULT_MAX_ATTACHMENTS) {
      err = `max:${DEFAULT_MAX_ATTACHMENTS}`
      break
    }
    if (!isImageFile(file)) {
      err = `type:${file.name || 'file'}`
      continue
    }
    if (file.size > DEFAULT_MAX_ATTACHMENT_BYTES) {
      err = `size:${file.name}`
      continue
    }
    pending.value.push({
      id: createPendingId(),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name || 'image',
      mime: file.type || 'image/*',
      size: file.size,
    })
  }
  if (err?.startsWith('max:')) {
    agent.error = 'attach-max'
  } else if (err?.startsWith('type:')) {
    agent.error = `attach-type:${err.slice(5)}`
  } else if (err?.startsWith('size:')) {
    agent.error = `attach-size:${err.slice(5)}`
  }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  addFiles(files)
  input.value = ''
}

function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  const files: File[] = []
  for (const item of Array.from(items)) {
    if (item.kind === 'file') {
      const f = item.getAsFile()
      if (f) files.push(f)
    }
  }
  if (files.length) {
    e.preventDefault()
    addFiles(files)
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  if (agent.streaming) return
  const files = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : []
  addFiles(files)
}

async function resolveAttachments(): Promise<SendAttachment[]> {
  const out: SendAttachment[] = []
  for (const a of pending.value) {
    const dataUrl = await fileToDataUrl(a.file)
    out.push({
      url: dataUrl,
      mime: a.mime,
      name: a.name,
      detail: 'auto',
    })
  }
  return out
}

async function submit() {
  const text = draft.value.trim()
  const hasAtt = pending.value.length > 0
  if ((!text && !hasAtt) || agent.streaming) return
  const snapshot = [...pending.value]
  let attachments: SendAttachment[] = []
  try {
    attachments = await resolveAttachments()
  } catch (err) {
    agent.error = err instanceof Error ? err.message : String(err)
    return
  }
  draft.value = ''
  clearPending()
  const accepted = await agent.send(text, attachments.length ? { attachments } : undefined)
  // Restore input / chips if send rejected before starting (settings / Nano).
  if (!accepted) {
    draft.value = text
    for (const a of snapshot) {
      // Recreate object URLs for restored chips.
      pending.value.push({
        ...a,
        previewUrl: URL.createObjectURL(a.file),
      })
    }
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    void submit()
  }
}

onBeforeUnmount(() => {
  revokeAll()
})
</script>

<template>
  <div class="border-t px-3 py-3" data-testid="agent-composer">
    <div class="mx-auto w-full max-w-5xl">
      <div
        class="bg-background focus-within:border-ring focus-within:ring-ring/50 flex min-h-[108px] flex-col gap-2 rounded-2xl border p-3 shadow-xs focus-within:ring-[3px]"
        :class="dragOver ? 'border-ring ring-ring/40 ring-[3px]' : ''"
        data-testid="agent-composer-dropzone"
        @dragenter.prevent="dragOver = true"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop="onDrop"
      >
        <div
          v-if="pending.length"
          class="flex flex-wrap gap-1.5"
          data-testid="agent-attach-chips"
        >
          <div
            v-for="a in pending"
            :key="a.id"
            class="bg-muted/50 relative flex items-center gap-1.5 rounded-md border py-0.5 pr-1 pl-0.5"
          >
            <img
              :src="a.previewUrl"
              :alt="a.name"
              class="size-7 rounded object-cover"
            >
            <div class="max-w-[7rem] min-w-0 leading-tight">
              <div class="truncate text-[11px] font-medium">{{ a.name }}</div>
              <div class="text-muted-foreground text-[10px]">{{ formatBytes(a.size) }}</div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-5 shrink-0 rounded-full"
              :aria-label="$t('agent.attachRemove')"
              :disabled="agent.streaming"
              @click="removePending(a.id)"
            >
              <X class="size-3" />
            </Button>
          </div>
        </div>

        <div class="flex items-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="mb-0.5 size-6 shrink-0 rounded-full"
            data-testid="agent-attach"
            :disabled="agent.streaming"
            :aria-label="$t('agent.attach')"
            :title="$t('agent.attach')"
            @click="openFilePicker"
          >
            <Plus class="size-3.5" stroke-width="2.25" />
          </Button>
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            :accept="DEFAULT_ACCEPT"
            multiple
            data-testid="agent-attach-input"
            @change="onFileChange"
          >
          <Textarea
            v-model="draft"
            class="min-h-[84px] h-auto max-h-48 flex-1 resize-none border-0 bg-transparent px-1 py-1 font-sans shadow-none focus-visible:border-transparent focus-visible:ring-0"
            :placeholder="$t('agent.placeholder')"
            :disabled="agent.streaming"
            rows="3"
            data-testid="agent-composer-input"
            @keydown="onKeydown"
            @paste="onPaste"
          />
          <Button
            v-if="agent.streaming"
            variant="outline"
            size="icon"
            class="mb-0.5 size-8 shrink-0 rounded-full"
            data-testid="agent-stop"
            :aria-label="$t('agent.stop')"
            @click="agent.stop()"
          >
            <Square class="size-3 fill-current" />
          </Button>
          <Button
            v-else
            size="icon"
            class="mb-0.5 size-8 shrink-0 rounded-full"
            data-testid="agent-send"
            :disabled="!canSend"
            :aria-label="$t('agent.send')"
            @click="submit"
          >
            <ArrowUp class="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
