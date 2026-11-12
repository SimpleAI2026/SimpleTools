<script setup lang="ts">
import { computed, reactive } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import { metaTags, type MetaInput } from './logic'

const form = reactive<MetaInput>({
  title: 'SimpleTools',
  description: 'Offline tools that stay on this device.',
  url: 'https://example.com/tools',
  image: 'https://example.com/cover.png',
  siteName: 'SimpleTools',
  author: '',
  keywords: 'offline, tools',
  locale: 'en',
  robots: 'index,follow',
  twitterCard: 'summary_large_image',
})
const output = computed(() => metaTags(form))
const fields = ['title', 'description', 'url', 'image', 'siteName', 'author', 'keywords', 'locale', 'robots'] as const
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2">
      <Label v-for="field in fields" :key="field" class="flex flex-col items-start gap-2">
        {{ $t(`tools.meta-tag-generator.fields.${field}`) }}
        <Textarea v-if="field === 'description'" v-model="form[field]" class="min-h-20" />
        <Input v-else v-model="form[field]" />
      </Label>
      <Label class="flex flex-col items-start gap-2">
        {{ $t('tools.meta-tag-generator.fields.twitterCard') }}
        <select v-model="form.twitterCard" class="border-input bg-background h-10 rounded-md border px-3">
          <option value="summary">summary</option>
          <option value="summary_large_image">summary_large_image</option>
        </select>
      </Label>
    </div>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="output" /></div>
      <pre class="bg-muted/40 overflow-auto rounded-md border p-3 font-mono text-xs break-all whitespace-pre-wrap" data-testid="tool-output">{{ output }}</pre>
    </section>
  </div>
</template>
