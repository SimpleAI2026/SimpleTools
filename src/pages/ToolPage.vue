<script setup lang="ts">
import { computed, defineAsyncComponent, h } from 'vue'
import { getTool } from '@/registry'
import ToolLayout from '@/components/shared/ToolLayout.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { i18n } from '@/i18n'

/** Full-bleed tools that own their chrome (no ToolLayout title/favorite bar). */
const IMMERSIVE_SLUGS = new Set(['agent'])

const props = defineProps<{ slug: string }>()
const tool = computed(() => getTool(props.slug))
const immersive = computed(() => IMMERSIVE_SLUGS.has(props.slug))

const ToolComponent = computed(() => {
  const t = tool.value
  if (!t) return null
  return defineAsyncComponent({
    loader: t.component,
    loadingComponent: { render: () => h('p', { class: 'text-muted-foreground text-sm' }, i18n.global.t('app.loading')) },
    errorComponent: { render: () => h(ErrorAlert, { message: i18n.global.t('app.loadError') }) },
    delay: 150,
  })
})
</script>

<template>
  <!--
    Immersive shell owns flex-col height fill. Do NOT put flex-col on the tool
    root via fallthrough — AgentPage is a row flex (sidebar + chat); flex-col
    + thread-list h-full pushed the composer outside overflow:hidden.
  -->
  <div v-if="tool && immersive" class="flex min-h-0 flex-1 flex-col">
    <component :is="ToolComponent" :key="tool.slug" class="min-h-0 flex-1" />
  </div>
  <ToolLayout v-else-if="tool" :key="tool.slug" :tool="tool">
    <component :is="ToolComponent" />
  </ToolLayout>
</template>
