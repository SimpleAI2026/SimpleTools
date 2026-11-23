<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Download } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { CHROME_WEB_STORE_URL } from '@/components/layout/install-entry'
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
  /** Narrow viewport with a coarse pointer: desktop Chrome is required to install. */
  handheld?: boolean
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
    <DialogContent class="sm:max-w-md">
      <div class="contents" data-testid="install-extension-modal">
        <DialogHeader>
          <DialogTitle>{{ $t(titleKey) }}</DialogTitle>
          <DialogDescription class="sr-only">{{ $t(titleKey) }}</DialogDescription>
        </DialogHeader>

        <div v-if="kind === 'chrome'" class="flex flex-col gap-3">
          <Button as-child class="w-full sm:w-auto">
            <a
              data-testid="chrome-store-link"
              :href="CHROME_WEB_STORE_URL"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ $t('app.extensions.chromeStore') }}
            </a>
          </Button>
          <p
            v-if="handheld"
            class="text-muted-foreground text-xs leading-relaxed"
            data-testid="chrome-handheld-note"
          >
            {{ $t('app.extensions.chromeHandheld') }}
          </p>
          <details data-testid="chrome-manual-install" class="rounded-md border px-3 py-2">
            <summary class="cursor-pointer text-sm font-medium">{{ $t('app.extensions.chromeManual') }}</summary>
            <ol class="text-muted-foreground mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
              <li v-for="(step, i) in steps" :key="i">{{ step }}</li>
            </ol>
            <p
              v-if="!checking && !artifactReady"
              class="bg-muted text-muted-foreground mt-3 rounded-md px-3 py-2 text-xs leading-relaxed"
              data-testid="extension-missing-hint"
            >
              {{ missingHint }}
            </p>
            <Button
              variant="outline"
              class="mt-3"
              :disabled="!artifactReady || checking"
              data-testid="extension-download"
              @click="triggerDownload"
            >
              <Download />
              {{ $t('common.download') }}
            </Button>
          </details>
        </div>

        <template v-else>
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
        </template>

        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">{{ $t('app.extensions.close') }}</Button>
          </DialogClose>
          <Button
            v-if="kind !== 'chrome'"
            :disabled="!artifactReady || checking"
            data-testid="extension-download"
            @click="triggerDownload"
          >
            <Download />
            {{ $t('common.download') }}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
