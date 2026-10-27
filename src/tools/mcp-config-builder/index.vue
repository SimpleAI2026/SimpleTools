<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { downloadText } from '@/lib/download'
import {
  buildMcpConfig,
  emptyFormServer,
  validateMcpJson,
  type McpFormServer,
  type McpTarget,
} from './logic'

const { locale, t } = useI18n()
const mode = ref<'build' | 'validate'>('build')
const target = ref<McpTarget>('cursor')
const servers = ref<McpFormServer[]>([emptyFormServer()])
const paste = ref('')
const output = computed(() => buildMcpConfig(servers.value))
const issues = computed(() => validateMcpJson(paste.value.trim() || '{}', locale.value.startsWith('zh') ? 'zh' : 'en'))
const modeOptions = computed(() => [
  ['build', t('tools.mcp-config-builder.modeBuild')] as const,
  ['validate', t('tools.mcp-config-builder.modeValidate')] as const,
])
const targetOptions = computed(() => [
  ['cursor', t('tools.mcp-config-builder.targetCursor')] as const,
  ['claude-desktop', t('tools.mcp-config-builder.targetClaude')] as const,
  ['generic', t('tools.mcp-config-builder.targetGeneric')] as const,
])

function loadSample() {
  servers.value = [
    {
      ...emptyFormServer(),
      name: 'filesystem',
      transport: 'stdio',
      command: 'npx',
      argsText: '-y\n@modelcontextprotocol/server-filesystem\n/tmp',
      envText: '',
    },
  ]
  mode.value = 'build'
  paste.value = JSON.stringify(
    {
      mcpServers: {
        filesystem: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
        },
      },
    },
    null,
    2,
  )
}
function addServer() {
  const s = emptyFormServer()
  s.name = `server-${servers.value.length + 1}`
  servers.value.push(s)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <ModeToggle v-model="mode" :options="modeOptions" />
    <template v-if="mode === 'build'">
      <div class="flex flex-col gap-2">
        <Label>{{ $t('tools.mcp-config-builder.target') }}</Label>
        <ModeToggle v-model="target" :options="targetOptions" />
      </div>
      <div v-for="(s, i) in servers" :key="i" class="flex flex-col gap-3 rounded-lg border p-3">
        <div class="flex flex-wrap items-end gap-3">
          <div class="flex min-w-40 flex-1 flex-col gap-1.5">
            <Label>{{ $t('tools.mcp-config-builder.serverName') }}</Label>
            <Input v-model="s.name" class="font-mono" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label>{{ $t('tools.mcp-config-builder.transport') }}</Label>
            <select v-model="s.transport" class="border-input bg-background h-9 rounded-md border px-2">
              <option value="stdio">{{ $t('tools.mcp-config-builder.stdio') }}</option>
              <option value="url">{{ $t('tools.mcp-config-builder.url') }}</option>
            </select>
          </div>
          <Button size="sm" variant="ghost" :disabled="servers.length <= 1" @click="servers.splice(i, 1)">{{ $t('tools.mcp-config-builder.removeServer') }}</Button>
        </div>
        <template v-if="s.transport === 'stdio'">
          <div class="flex flex-col gap-1.5">
            <Label>{{ $t('tools.mcp-config-builder.command') }}</Label>
            <Input v-model="s.command" class="font-mono" />
          </div>
          <div class="grid gap-3 lg:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <Label>{{ $t('tools.mcp-config-builder.args') }}</Label>
              <Textarea v-model="s.argsText" class="min-h-[120px]" />
            </div>
            <div class="flex flex-col gap-1.5">
              <Label>{{ $t('tools.mcp-config-builder.env') }}</Label>
              <Textarea v-model="s.envText" class="min-h-[120px]" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col gap-1.5">
            <Label>{{ $t('tools.mcp-config-builder.urlField') }}</Label>
            <Input v-model="s.url" class="font-mono" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label>{{ $t('tools.mcp-config-builder.headers') }}</Label>
            <Textarea v-model="s.headersText" class="min-h-[120px]" />
          </div>
        </template>
      </div>
      <Button size="sm" variant="outline" @click="addServer">{{ $t('tools.mcp-config-builder.addServer') }}</Button>
      <div class="flex flex-col gap-2">
        <div class="flex h-8 items-center justify-between">
          <Label>{{ $t('common.output') }}</Label>
          <div class="flex gap-2">
            <CopyButton :text="output" />
            <Button size="sm" variant="outline" @click="downloadText(output, 'mcp.json', 'application/json')">{{ $t('common.download') }}</Button>
          </div>
        </div>
        <Textarea :model-value="output" readonly class="min-h-[500px] bg-muted/40 min-h-[500px] h-[500px]" />
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col gap-2">
        <Label>{{ $t('tools.mcp-config-builder.pasteJson') }}</Label>
        <Textarea v-model="paste" class="min-h-[500px] min-h-[500px] h-[500px]" />
      </div>
      <div>
        <h3 class="mb-2 text-sm font-medium">{{ $t('tools.mcp-config-builder.issues') }}</h3>
        <p v-if="!paste.trim()" class="text-muted-foreground text-sm">—</p>
        <p v-else-if="issues.length === 0" class="text-sm text-emerald-600">{{ $t('tools.mcp-config-builder.valid') }}</p>
        <ul v-else class="flex flex-col gap-2">
          <li v-for="(iss, i) in issues" :key="i" class="rounded-md border border-destructive/40 p-2 text-sm text-destructive">
            <code class="font-mono">{{ iss.path }}</code>: {{ iss.message }}
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
