<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-4">
      <Button @click="goBack" variant="outline">Back</Button>
      <client-only>
        <Button @click="exportEssay" variant="outline" :disabled="isExporting">
          {{ isExporting ? 'Exporting...' : 'Export' }}
        </Button>
      </client-only>
    </div>
    <h1 class="text-4xl font-bold mb-2">Document Editor</h1>
    <p class="text-xl text-gray-600 mb-8">
      Create and edit rich text documents with ease.
    </p>

    <div class="rounded-lg shadow-md p-6 editor-container">
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div :class="['animate-spin rounded-full h-32 w-32 border-b-2', dark ? 'border-gray-900' : 'border-gray-300']"></div>
      </div>
      <template v-else>
        <TextEditor
          ref="textEditorRef"
          v-model="fullEssayContent"
          class="prose-container"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";
import { useEssayStore } from "@/stores/essayStore";
import { storeToRefs } from "pinia";
import { Button } from "@/components/ui/button";
import TextEditor from "~/components/editor/TextEditor.vue";
import { usePdfExport } from '~/composables/usePdfExport';

const router = useRouter();
const essayStore = useEssayStore();
const { essay } = storeToRefs(essayStore);

const isLoading = ref(true);
const fullEssayContent = ref("");

const documentTitle = computed(() => essay.value.title || "Untitled Document");

const { isExporting, exportToPdf } = usePdfExport();

const textEditorRef = ref(null);

function formatEssayContent() {
  let formattedContent = `<h1>${essay.value.title}</h1>`;
  essay.value.sections.forEach((section) => {
    formattedContent += `<h2>${section.title}</h2>`;
    formattedContent += `<p>${section.content || ""}</p><br>`;
  });
  return formattedContent;
}

const updateContent = (newContent: string) => {
  fullEssayContent.value = newContent;
};

const exportEssay = async () => {
  if (textEditorRef.value?.quillInstance) {
    await exportToPdf(textEditorRef.value.quillInstance, `${documentTitle.value}.pdf`);
  } else {
    console.error('Quill editor not initialized');
  }
};

const goBack = () => {
  router.push("/essay/content");
};

onMounted(async () => {
  fullEssayContent.value = formatEssayContent();
  isLoading.value = false;
});
</script>

<style>
.editor-container {
  width: 100%;
  max-width: none;
}

.prose-container {
  max-width: none !important;
}

.prose-container .ProseMirror {
  max-width: none;
  width: 100%;
}

.prose {
  max-width: none;
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
