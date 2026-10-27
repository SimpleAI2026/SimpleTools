<script setup lang="ts">
import { computed, defineAsyncComponent, h } from 'vue'
import { getTool } from '@/registry'
import ToolLayout from '@/components/shared/ToolLayout.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { i18n } from '@/i18n'

const props = defineProps<{ slug: string }>()
const tool = computed(() => getTool(props.slug))

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
  <ToolLayout v-if="tool" :key="tool.slug" :tool="tool">
    <component :is="ToolComponent" />
  </ToolLayout>
</template>
