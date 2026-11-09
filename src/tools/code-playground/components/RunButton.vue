<script setup lang="ts">
import { computed } from "vue";
import { Loader2, Play } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import type { RunStatus } from "@/tools/code-playground/stores/run";
import { t } from "@/tools/code-playground/i18n";

const props = defineProps<{
  running?: boolean;
  status?: RunStatus;
  disabled?: boolean;
  testId?: string;
}>();

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const label = computed(() => {
  if (!props.running) return "Run";
  if (props.status === "preparing") return t("preparing");
  if (props.status === "compile") return t("compiling");
  if (props.status === "link") return t("linking");
  return t("running");
});
</script>

<template>
  <Button type="button" size="xs" class="max-md:h-11 max-md:px-4" :data-testid="testId" :disabled="disabled" @click="emit('click', $event)">
    <Loader2 v-if="running" class="animate-spin motion-reduce:animate-none" />
    <Play v-else />
    {{ label }}
  </Button>
</template>
