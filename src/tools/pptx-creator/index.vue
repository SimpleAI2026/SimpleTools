<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { downloadBlob } from '@/lib/download'
import { buildPptx, parseSlides, THEMES, type DeckOptions, type ThemeName } from './logic'

const { t } = useI18n()
const SAMPLE = '# 产品发布会\n## 2026 秋季\n---\n# 议程\n- 回顾\n- 新功能\n  - 离线工具箱\n  - 双语界面\n- 问答\n> 控制在 20 分钟内\n---\n# 关键数据\n- 117 个本地工具\n- 0 次数据上传\n'
const md = ref(SAMPLE)
const o = reactive<DeckOptions>({ theme: 'light', layout: '16x9', title: 'Presentation', font: 'Arial' })
const slides = computed(() => parseSlides(md.value))
const error = ref('')
const busy = ref(false)
const themeOptions = computed(() => (Object.keys(THEMES) as ThemeName[]).map((k) => [k, t(`tools.pptx-creator.themes.${k}`)] as const))
const th = computed(() => THEMES[o.theme])
async function create() {
  busy.value = true
  error.value = ''
  try {
    const bytes = await buildPptx(slides.value, o)
    downloadBlob(new Blob([bytes as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }), `${o.title || 'presentation'}.pptx`)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}

function loadSample() {
  md.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <Label>{{ $t('tools.pptx-creator.title') }} <Input v-model="o.title" class="w-48" /></Label>
      <span class="text-sm">{{ $t('tools.pptx-creator.theme') }}</span>
      <ModeToggle v-model="o.theme" :options="themeOptions" />
      <ModeToggle v-model="o.layout" :options="[['16x9', '16:9'], ['4x3', '4:3']]" />
      <Label>{{ $t('tools.pptx-creator.font') }}
        <select v-model="o.font" class="border-input bg-background h-9 rounded-md border px-2">
          <option v-for="f in ['Arial', 'Calibri', 'Microsoft YaHei', 'PingFang SC', 'Georgia']" :key="f">{{ f }}</option>
        </select>
      </Label>
      <Button :disabled="busy || !slides.length" @click="create"><Download /> {{ $t('tools.pptx-creator.create') }}</Button>
      <span class="text-muted-foreground text-sm">{{ $t('tools.pptx-creator.slides', { n: slides.length }) }}</span>
    </div>
    <p class="text-muted-foreground text-xs">{{ $t('tools.pptx-creator.help') }}</p>
    <ErrorAlert v-if="error" :message="error" />
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <Textarea v-model="md" class="min-h-[500px] font-mono min-h-[500px] h-[500px]" spellcheck="false" data-testid="tool-input" />
      <div class="flex max-h-[36rem] flex-col gap-3 overflow-auto">
        <div
          v-for="(s, i) in slides"
          :key="i"
          class="relative shrink-0 overflow-hidden rounded-md border p-4 shadow-sm"
          :class="o.layout === '16x9' ? 'aspect-video' : 'aspect-[4/3]'"
          :style="{ background: `#${th.bg}`, fontFamily: o.font }"
        >
          <div class="text-lg font-bold" :style="{ color: `#${th.title}` }">{{ s.title }}</div>
          <div v-if="s.subtitle" class="text-sm" :style="{ color: `#${th.accent}` }">{{ s.subtitle }}</div>
          <ul class="mt-2 text-sm" :style="{ color: `#${th.text}` }">
            <li v-for="(b, j) in s.bullets" :key="j" :style="{ paddingLeft: `${b.level * 16}px` }">• {{ b.text }}</li>
          </ul>
          <span class="absolute right-2 bottom-1 text-xs" :style="{ color: `#${th.text}` }">{{ i + 1 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
