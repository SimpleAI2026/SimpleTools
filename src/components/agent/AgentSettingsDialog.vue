<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  DEFAULT_AGENT_MODEL,
  CHROME_AI_STATUS,
  type ChatProviderId,
} from '@/agent'
import { AGENT_MODEL_PRESETS } from '@/tools/_shared/ai-models'
import { useAgentStore } from '@/stores/agent'

const CUSTOM_PRESET = '__custom__'

const agent = useAgentStore()
const {
  settingsOpen,
  draftSettings,
  chromeAiStatus,
  chromeAiProgress,
  chromeAiChecking,
  chromeAiDownloading,
} = storeToRefs(agent)

watch(settingsOpen, (isOpen) => {
  if (isOpen) {
    agent.loadSettingsIntoDraft()
    void agent.refreshChromeAiStatus()
  }
})

function onCancel() {
  agent.loadSettingsIntoDraft()
  settingsOpen.value = false
}

const isChrome = import.meta.env.VITE_TARGET === 'chrome'

function onSave() {
  agent.saveSettings()
}

const provider = computed({
  get: () => (draftSettings.value.provider === 'chrome-ai' ? 'chrome-ai' : 'openai') as ChatProviderId,
  set: (v: ChatProviderId) => agent.setProvider(v),
})

const isChromeAi = computed(() => provider.value === 'chrome-ai')

const chromeAiLabelKey = computed(() => {
  if (chromeAiChecking.value) return 'agent.chromeAiDetecting'
  switch (chromeAiStatus.value) {
    case CHROME_AI_STATUS.AVAILABLE:
      return 'agent.chromeAiAvailable'
    case CHROME_AI_STATUS.DOWNLOADABLE:
      return 'agent.chromeAiDownloadable'
    case CHROME_AI_STATUS.DOWNLOADING:
      return 'agent.chromeAiDownloading'
    case CHROME_AI_STATUS.UNAVAILABLE:
      return 'agent.chromeAiUnavailable'
    default:
      return 'agent.chromeAiUnknown'
  }
})

const showDownload = computed(
  () =>
    chromeAiStatus.value === CHROME_AI_STATUS.DOWNLOADABLE ||
    chromeAiStatus.value === CHROME_AI_STATUS.DOWNLOADING ||
    chromeAiDownloading.value,
)

const presetSelectValue = computed(() => {
  const id = (draftSettings.value.model || '').trim()
  if (id && AGENT_MODEL_PRESETS.some((m) => m.id === id)) return id
  return CUSTOM_PRESET
})

function onPresetChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (value && value !== CUSTOM_PRESET) {
    draftSettings.value.model = value
  }
}

function onProviderChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (value === 'chrome-ai' || value === 'openai') {
    agent.setProvider(value)
  }
}
</script>

<template>
  <Dialog v-model:open="settingsOpen">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader data-testid="agent-settings-dialog">
        <DialogTitle>{{ $t('agent.settingsTitle') }}</DialogTitle>
        <DialogDescription>{{ $t('agent.settingsDesc') }}</DialogDescription>
      </DialogHeader>

      <p
        v-if="isChrome && !isChromeAi"
        class="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
        data-testid="agent-settings-chrome-warning"
      >
        {{ $t('agent.chromeHostWarning') }}
      </p>

      <div class="grid gap-3">
        <div class="grid gap-1.5">
          <Label>{{ $t('agent.provider') }}</Label>
          <div
            class="grid gap-2 sm:grid-cols-2"
            role="radiogroup"
            :aria-label="$t('agent.provider')"
            data-testid="agent-settings-provider"
          >
            <label
              class="border-input flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
              :class="provider === 'chrome-ai' ? 'border-primary bg-primary/5' : ''"
            >
              <input
                type="radio"
                name="agent-provider"
                value="chrome-ai"
                data-testid="agent-settings-provider-chrome-ai"
                :checked="provider === 'chrome-ai'"
                @change="onProviderChange"
              />
              <span>{{ $t('agent.providerChromeAi') }}</span>
            </label>
            <label
              class="border-input flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
              :class="provider === 'openai' ? 'border-primary bg-primary/5' : ''"
            >
              <input
                type="radio"
                name="agent-provider"
                value="openai"
                data-testid="agent-settings-provider-openai"
                :checked="provider === 'openai'"
                @change="onProviderChange"
              />
              <span>{{ $t('agent.providerOpenai') }}</span>
            </label>
          </div>
        </div>

        <div
          v-if="isChromeAi"
          class="grid gap-2 rounded-md border border-border bg-muted/40 px-3 py-3"
          data-testid="agent-settings-chrome-ai-panel"
        >
          <p class="text-sm font-medium">{{ $t('agent.chromeAiStatusTitle') }}</p>
          <div class="flex items-center gap-2 text-sm">
            <span
              class="inline-block size-2 rounded-full"
              :class="{
                'bg-emerald-500': chromeAiStatus === CHROME_AI_STATUS.AVAILABLE,
                'bg-amber-500':
                  chromeAiStatus === CHROME_AI_STATUS.DOWNLOADABLE ||
                  chromeAiStatus === CHROME_AI_STATUS.DOWNLOADING ||
                  chromeAiDownloading,
                'bg-muted-foreground':
                  chromeAiStatus === CHROME_AI_STATUS.UNKNOWN || chromeAiChecking,
                'bg-destructive': chromeAiStatus === CHROME_AI_STATUS.UNAVAILABLE,
              }"
              aria-hidden="true"
            />
            <span data-testid="agent-settings-chrome-ai-label">{{ $t(chromeAiLabelKey) }}</span>
          </div>
          <p
            v-if="chromeAiStatus === CHROME_AI_STATUS.DOWNLOADING || chromeAiDownloading"
            class="text-muted-foreground text-xs"
            data-testid="agent-settings-chrome-ai-progress"
          >
            {{ Math.round((chromeAiProgress || 0) * 100) }}%
          </p>
          <p class="text-muted-foreground text-xs">{{ $t('agent.chromeAiHint') }}</p>
          <p class="text-muted-foreground text-xs">{{ $t('agent.chromeAiToolsWarn') }}</p>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="agent-settings-chrome-ai-detect"
              :disabled="chromeAiChecking"
              @click="agent.refreshChromeAiStatus()"
            >
              {{ $t('agent.chromeAiDetect') }}
            </Button>
            <Button
              v-if="showDownload"
              type="button"
              size="sm"
              data-testid="agent-settings-chrome-ai-download"
              :disabled="chromeAiDownloading || chromeAiStatus === CHROME_AI_STATUS.DOWNLOADING"
              @click="agent.downloadChromeAiModel()"
            >
              {{ $t('agent.chromeAiDownload') }}
            </Button>
          </div>
        </div>

        <template v-if="!isChromeAi">
          <div class="grid gap-1.5">
            <Label for="agent-api-base">{{ $t('agent.apiBaseUrl') }}</Label>
            <Input
              id="agent-api-base"
              v-model="draftSettings.apiBaseUrl"
              data-testid="agent-settings-base-url"
              placeholder="https://api.openai.com/v1"
            />
          </div>
          <div class="grid gap-1.5">
            <Label for="agent-api-key">{{ $t('agent.apiKey') }}</Label>
            <Input
              id="agent-api-key"
              v-model="draftSettings.apiKey"
              type="password"
              autocomplete="off"
              data-testid="agent-settings-api-key"
            />
          </div>
          <div class="grid gap-1.5">
            <Label for="agent-model-preset">{{ $t('agent.model') }}</Label>
            <select
              id="agent-model-preset"
              class="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
              data-testid="agent-settings-model-preset"
              :value="presetSelectValue"
              @change="onPresetChange"
            >
              <option
                v-for="m in AGENT_MODEL_PRESETS"
                :key="m.id"
                :value="m.id"
              >
                {{ m.provider }} · {{ m.label }}
              </option>
              <option :value="CUSTOM_PRESET">{{ $t('agent.modelCustom') }}</option>
            </select>
            <Input
              id="agent-model"
              v-model="draftSettings.model"
              data-testid="agent-settings-model"
              :placeholder="DEFAULT_AGENT_MODEL"
            />
            <p class="text-muted-foreground text-xs">{{ $t('agent.modelCustomHint') }}</p>
          </div>
          <div class="flex items-center gap-2">
            <Switch
              id="agent-remember-key"
              v-model="draftSettings.rememberKey"
              data-testid="agent-settings-remember-key"
            />
            <Label for="agent-remember-key">{{ $t('agent.rememberKey') }}</Label>
          </div>
        </template>

        <div class="grid gap-1.5">
          <Label for="agent-system-prompt">{{ $t('agent.systemPrompt') }}</Label>
          <Textarea
            id="agent-system-prompt"
            v-model="draftSettings.systemPrompt"
            class="min-h-[96px] h-24 font-sans"
            data-testid="agent-settings-system-prompt"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" data-testid="agent-settings-cancel" @click="onCancel">
          {{ $t('agent.cancel') }}
        </Button>
        <Button data-testid="agent-settings-save" @click="onSave">
          {{ $t('agent.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
