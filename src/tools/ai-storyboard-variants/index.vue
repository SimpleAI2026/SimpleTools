<script setup lang="ts">
import ArtifactWorkbench from '@/components/shared/ArtifactWorkbench.vue'
import { present, SAMPLE } from './logic'
</script>

<template>
  <ArtifactWorkbench slug="ai-storyboard-variants" :sample="SAMPLE" :present="present" />
</template>
