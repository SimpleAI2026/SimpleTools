<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Download } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type ExtensionKind = 'chrome' | 'vscode'

const props = defineProps<{
  open: boolean
  kind: ExtensionKind
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { t, te } = useI18n()

const openModel = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})

const FILE_NAME: Record<ExtensionKind, string> = {
  chrome: 'simpletools-chrome.zip',
  vscode: 'simpletools-vscode.vsix',
}

const downloadHref = computed(
  () => `${import.meta.env.BASE_URL}downloads/${FILE_NAME[props.kind]}`,
)

const artifactReady = ref(true)
const checking = ref(false)

async function checkArtifact() {
  checking.value = true
  try {
    const res = await fetch(downloadHref.value, { method: 'HEAD', cache: 'no-store' })
    artifactReady.value = res.ok
  } catch {
    artifactReady.value = false
  } finally {
    checking.value = false
  }
}

watch(
  () => [props.open, props.kind] as const,
  ([isOpen]) => {
    if (isOpen) void checkArtifact()
  },
)

const titleKey = computed(() =>
  props.kind === 'chrome' ? 'app.extensions.chromeTitle' : 'app.extensions.vscodeTitle',
)

const steps = computed(() => {
  const prefix = props.kind === 'chrome' ? 'app.extensions.chromeStep' : 'app.extensions.vscodeStep'
  const list: string[] = []
  for (let i = 1; i <= 6; i++) {
    const key = `${prefix}${i}`
    if (!te(key)) break
    list.push(t(key))
  }
  return list
})

const missingHint = computed(() =>
  props.kind === 'chrome' ? t('app.extensions.chromeMissing') : t('app.extensions.vscodeMissing'),
)

function triggerDownload() {
  if (!artifactReady.value) return
  const a = document.createElement('a')
  a.href = downloadHref.value
  a.download = FILE_NAME[props.kind]
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}
</script>

<template>
  <Dialog v-model:open="openModel">
    <DialogContent class="sm:max-w-md" data-testid="install-extension-modal">
      <DialogHeader>
        <DialogTitle>{{ $t(titleKey) }}</DialogTitle>
        <DialogDescription class="sr-only">{{ $t(titleKey) }}</DialogDescription>
      </DialogHeader>

      <ol class="text-muted-foreground list-decimal space-y-2 pl-5 text-sm leading-relaxed">
        <li v-for="(step, i) in steps" :key="i">{{ step }}</li>
      </ol>

      <p
        v-if="!checking && !artifactReady"
        class="bg-muted text-muted-foreground rounded-md px-3 py-2 text-xs leading-relaxed"
        data-testid="extension-missing-hint"
      >
        {{ missingHint }}
      </p>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">{{ $t('app.extensions.close') }}</Button>
        </DialogClose>
        <Button
          :disabled="!artifactReady || checking"
          data-testid="extension-download"
          @click="triggerDownload"
        >
          <Download />
          {{ $t('common.download') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
