<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-24 text-center">
    <h1 class="text-4xl font-bold">404</h1>
    <p class="text-lg font-medium">{{ $t('app.notFound') }}</p>
    <p class="text-muted-foreground text-sm">{{ $t('app.notFoundDesc') }}</p>
    <Button as-child><RouterLink to="/">{{ $t('app.back') }}</RouterLink></Button>
  </div>
</template>
