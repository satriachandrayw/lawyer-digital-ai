<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEssayStore } from '@/stores/essayStore';
import { storeToRefs } from 'pinia';
import { Editor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const essayStore = useEssayStore();
const { topic, sections, contents } = storeToRefs(essayStore);

const editor = ref<Editor | null>(null);

onMounted(() => {
  editor.value = new Editor({
    extensions: [StarterKit],
    content: formatEssayContent(),
    editable: true,
  });
});

function formatEssayContent() {
  let formattedContent = `<h1>${topic.value}</h1>`;
  sections.value.forEach((section, index) => {
    formattedContent += `<h2>${section.title}</h2>`;
    formattedContent += `<p>${contents.value[index]}</p>`;
  });
  return formattedContent;
}

const exportEssay = () => {
  if (editor.value) {
    const htmlContent = editor.value.getHTML();
    // Implement export functionality here
    console.log('Exporting essay:', htmlContent);
  }
};
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Compose the Essay</h1>
    <editor-content :editor="editor" class="prose max-w-screen-lg max-h-screen" />
    <button @click="exportEssay" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      Export Essay
    </button>
  </div>
</template>
