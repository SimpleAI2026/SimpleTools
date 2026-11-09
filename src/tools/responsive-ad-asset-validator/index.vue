<script setup lang="ts">
import ArtifactWorkbench from '@/components/shared/ArtifactWorkbench.vue'
import { present, SAMPLE } from './logic'
</script>

<template>
  <ArtifactWorkbench slug="responsive-ad-asset-validator" :sample="SAMPLE" :present="present" />
</template>
