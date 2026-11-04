<script setup lang="ts">
import { watch } from 'vue'
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
import { useAgentStore } from '@/stores/agent'

const agent = useAgentStore()
const { settingsOpen, draftSettings } = storeToRefs(agent)

watch(settingsOpen, (isOpen) => {
  if (isOpen) agent.loadSettingsIntoDraft()
})

function onCancel() {
  agent.loadSettingsIntoDraft()
  settingsOpen.value = false
}

function onSave() {
  agent.saveSettings()
}
</script>

<template>
  <Dialog v-model:open="settingsOpen">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader data-testid="agent-settings-dialog">
        <DialogTitle>{{ $t('agent.settingsTitle') }}</DialogTitle>
        <DialogDescription>{{ $t('agent.settingsDesc') }}</DialogDescription>
      </DialogHeader>

      <div class="grid gap-3">
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
          <Label for="agent-model">{{ $t('agent.model') }}</Label>
          <Input
            id="agent-model"
            v-model="draftSettings.model"
            data-testid="agent-settings-model"
            placeholder="gpt-4o-mini"
          />
        </div>
        <div class="grid gap-1.5">
          <Label for="agent-system-prompt">{{ $t('agent.systemPrompt') }}</Label>
          <Textarea
            id="agent-system-prompt"
            v-model="draftSettings.systemPrompt"
            class="min-h-[96px] h-24 font-sans"
            data-testid="agent-settings-system-prompt"
          />
        </div>
        <div class="flex items-center gap-2">
          <Switch
            id="agent-remember-key"
            v-model="draftSettings.rememberKey"
            data-testid="agent-settings-remember-key"
          />
          <Label for="agent-remember-key">{{ $t('agent.rememberKey') }}</Label>
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
