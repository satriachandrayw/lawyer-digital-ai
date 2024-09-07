<template>
  <div class="tiptap-editor mx-auto">
    <editor-content :editor="editor" class="dark:prose-invert" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const props = defineProps<{
  initialContent: string;
}>();

const emit = defineEmits<{
  (e: 'update:content', content: string): void;
}>();

const editor = ref<Editor | null>(null);

onMounted(() => {
  editor.value = new Editor({
    extensions: [StarterKit],
    content: props.initialContent,
    editable: true,
    onUpdate: ({ editor }) => {
      emit('update:content', editor.getHTML());
    },
  });
});

watch(() => props.initialContent, (newContent) => {
  if (editor.value && newContent !== editor.value.getHTML()) {
    editor.value.commands.setContent(newContent);
  }
});
</script>

<style>
.prose {
  @apply text-gray-900 dark:text-gray-100;
}
.prose h1 {
  @apply text-3xl font-bold mb-4 dark:text-gray-100;
}
.prose h2 {
  @apply text-2xl font-semibold mt-6 mb-3 dark:text-gray-200;
}
.prose p {
  @apply mb-4 dark:text-gray-300;
}
</style>
