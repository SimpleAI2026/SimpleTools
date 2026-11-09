<script setup lang="ts">
import ArtifactWorkbench from '@/components/shared/ArtifactWorkbench.vue'
import { present, SAMPLE } from './logic'
</script>

<template>
  <ArtifactWorkbench slug="project-handoff-auditor" :sample="SAMPLE" :present="present" />
</template>
