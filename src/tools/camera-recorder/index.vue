<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { downloadBlob } from '@/lib/download'
import { extensionForMime, preferredRecorderMime } from './logic'

const video = ref<HTMLVideoElement | null>(null)
const error = ref('')
const recording = ref(false)
const live = ref(false)
const photoUrl = ref('')
let stream: MediaStream | null = null
const recorder = ref<MediaRecorder | null>(null)
let chunks: Blob[] = []

async function startCamera() {
  error.value = ''
  stop()
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    live.value = true
    if (video.value) {
      video.value.srcObject = stream
      await video.value.play()
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'camera'
  }
}
function stop() {
  recorder.value?.stop()
  recorder.value = null
  recording.value = false
  stream?.getTracks().forEach((track) => track.stop())
  stream = null
  live.value = false
}
function shoot() {
  const el = video.value
  if (!el) return
  const canvas = document.createElement('canvas')
  canvas.width = el.videoWidth || 640
  canvas.height = el.videoHeight || 360
  canvas.getContext('2d')?.drawImage(el, 0, 0)
  canvas.toBlob((blob) => {
    if (!blob) return
    if (photoUrl.value) URL.revokeObjectURL(photoUrl.value)
    photoUrl.value = URL.createObjectURL(blob)
    downloadBlob(blob, 'photo.jpg')
  }, 'image/jpeg')
}
function record() {
  if (!stream) return
  const mime = preferredRecorderMime()
  chunks = []
  const media = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
  recorder.value = media
  media.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data)
  }
  media.onstop = () => {
    const type = media.mimeType || mime || 'video/webm'
    downloadBlob(new Blob(chunks, { type }), `recording.${extensionForMime(type)}`)
    recording.value = false
  }
  media.start()
  recording.value = true
}
onUnmounted(() => {
  if (photoUrl.value) URL.revokeObjectURL(photoUrl.value)
  stop()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.camera-recorder.note') }}</p>
    <div class="flex flex-wrap gap-2">
      <Button @click="startCamera">{{ $t('tools.camera-recorder.start') }}</Button>
      <Button variant="outline" :disabled="!live" @click="shoot">{{ $t('tools.camera-recorder.photo') }}</Button>
      <Button v-if="!recording" variant="outline" :disabled="!live" @click="record">{{ $t('tools.camera-recorder.record') }}</Button>
      <Button v-else variant="secondary" @click="recorder?.stop()">{{ $t('tools.camera-recorder.stop') }}</Button>
    </div>
    <p v-if="error" class="text-destructive text-sm">{{ error }}</p>
    <video ref="video" class="bg-muted max-h-80 w-full rounded-md border" playsinline muted />
    <section v-if="photoUrl" class="flex flex-col gap-2">
      <Label>{{ $t('common.output') }}</Label>
      <img :src="photoUrl" alt="" class="max-h-48 rounded-md border" data-testid="tool-output" />
    </section>
  </div>
</template>
