<script setup lang="ts">
import ArtifactWorkbench from '@/components/shared/ArtifactWorkbench.vue'
import { present, SAMPLE } from './logic'
</script>

<template>
  <ArtifactWorkbench slug="owned-marketing-report" :sample="SAMPLE" :present="present" />
</template>
