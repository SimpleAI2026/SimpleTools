<script setup lang="ts">
import ArtifactWorkbench from '@/components/shared/ArtifactWorkbench.vue'
import { present, SAMPLE } from './logic'
</script>

<template>
  <ArtifactWorkbench slug="audio-level-auditor" :sample="SAMPLE" :present="present" binary="wav" />
</template>
