<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'
import { Button } from '@/components/ui/button'

const props = withDefaults(defineProps<{ text: string; label?: boolean }>(), { label: true })
const { copy, copied, isSupported } = useClipboard({ legacy: true, copiedDuring: 1500 })
</script>

<template>
  <Button
    variant="outline"
    size="sm"
    :disabled="!props.text || !isSupported"
    :aria-label="$t('common.copy')"
    @click="copy(props.text)"
  >
    <Check v-if="copied" />
    <Copy v-else />
    <span v-if="props.label">{{ copied ? $t('common.copied') : $t('common.copy') }}</span>
  </Button>
</template>
