<script setup lang="ts">
import { computed, defineAsyncComponent, h } from 'vue'
import { getTool } from '@/registry'
import ToolLayout from '@/components/shared/ToolLayout.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { i18n } from '@/i18n'
import { isImmersiveSlug } from '@/router/immersive'

const props = defineProps<{ slug: string }>()
const tool = computed(() => getTool(props.slug))
const immersive = computed(() => isImmersiveSlug(props.slug))

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
  <div v-if="tool && immersive" class="flex min-h-0 flex-1 flex-col">
    <component :is="ToolComponent" :key="tool.slug" class="min-h-0 flex-1" />
  </div>
  <ToolLayout v-else-if="tool" :key="tool.slug" :tool="tool">
    <component :is="ToolComponent" />
  </ToolLayout>
</template>
