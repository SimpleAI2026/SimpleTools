<script setup lang="ts">
/**
 * Shadcn-styled typing dots (SimpleChat element `.sc-typing` without Shadow DOM).
 * Shown while the assistant is streaming/waiting with no text yet.
 */
</script>

<template>
  <div
    class="bg-muted/40 inline-flex min-h-5 items-center gap-1.5 rounded-lg border px-3 py-3"
    role="status"
    aria-busy="true"
    :aria-label="$t('agent.typing')"
    data-testid="agent-typing"
  >
    <span class="agent-typing-dot bg-muted-foreground size-1.5 rounded-full" />
    <span class="agent-typing-dot bg-muted-foreground size-1.5 rounded-full" />
    <span class="agent-typing-dot bg-muted-foreground size-1.5 rounded-full" />
  </div>
</template>

<style scoped>
.agent-typing-dot {
  opacity: 0.45;
  animation: agent-typing-bounce 1.2s ease-in-out infinite;
}

.agent-typing-dot:nth-child(2) {
  animation-delay: 0.15s;
}

.agent-typing-dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes agent-typing-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.35;
  }
  30% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-typing-dot {
    animation: none;
    opacity: 0.7;
    transform: none;
  }
}
</style>
