<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { StarterKit } from '@tiptap/starter-kit'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { htmlToText } from './logic'

const editor = useEditor({
  extensions: [StarterKit],
  content: '<p>Hello from <strong>SimpleTools</strong>.</p>',
})
const html = computed(() => editor.value?.getHTML() ?? '')
const text = computed(() => htmlToText(html.value))
onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" @click="editor?.chain().focus().toggleBold().run()"><strong>B</strong></Button>
      <Button size="sm" variant="outline" @click="editor?.chain().focus().toggleItalic().run()"><em>I</em></Button>
      <Button size="sm" variant="outline" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()">H2</Button>
      <Button size="sm" variant="outline" @click="editor?.chain().focus().toggleBulletList().run()">{{ $t('tools.html-wysiwyg-editor.list') }}</Button>
    </div>
    <EditorContent :editor="editor" class="bg-background min-h-40 rounded-md border p-3 [&_.ProseMirror]:min-h-32 [&_.ProseMirror]:outline-none" />
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('tools.html-wysiwyg-editor.html') }}</Label><CopyButton :text="html" /></div>
      <pre class="bg-muted/40 max-h-48 overflow-auto rounded-md border p-3 font-mono text-xs whitespace-pre-wrap" data-testid="tool-output">{{ html }}</pre>
    </section>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('tools.html-wysiwyg-editor.plain') }}</Label><CopyButton :text="text" /></div>
      <pre class="bg-muted/40 rounded-md border p-3 whitespace-pre-wrap">{{ text }}</pre>
    </section>
  </div>
</template>
