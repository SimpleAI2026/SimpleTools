<script setup lang="ts">
import { BookOpen } from "lucide-vue-next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/tools/code-playground/components/ui/tooltip";
import { useDocsStore } from "@/tools/code-playground/stores/docs";
import { t } from "@/tools/code-playground/i18n";

const docs = useDocsStore();
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <button
        type="button"
        data-testid="quick-start"
        class="flex h-7 shrink-0 items-center gap-1 rounded-md border border-border px-2 text-xs hover:bg-accent max-md:h-11"
        :class="docs.open ? 'bg-accent text-foreground' : 'text-muted-foreground'"
        :aria-expanded="docs.open"
        aria-controls="docs-drawer"
        @click="docs.toggle()"
      >
        <BookOpen class="size-3.5" />
        <span class="max-md:sr-only">{{ t("quickStart") }}</span>
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom">{{ t("openQuickStartShort") }}</TooltipContent>
  </Tooltip>
</template>
