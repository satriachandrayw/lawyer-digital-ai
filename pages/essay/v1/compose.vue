<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-4">
      <Button @click="goBack" variant="outline">Back</Button>
      <Button @click="exportEssay" variant="outline">Export</Button>
    </div>
    <h1 class="text-4xl font-bold mb-2">Document Editor</h1>
    <p class="text-xl text-gray-600 mb-8">
      Create and edit rich text documents with ease.
    </p>

    <div class="rounded-lg shadow-md p-6 editor-container">
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"
        ></div>
      </div>
      <template v-else>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">{{ documentTitle }}</h2>
        </div>
        <TextEditor
          v-if="fullEssayContent"
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

const router = useRouter();
const essayStore = useEssayStore();
const { topic, sections, contents } = storeToRefs(essayStore);

const isLoading = ref(true);
const fullEssayContent = ref("");

const documentTitle = computed(() => topic.value || "Untitled Document");

function formatEssayContent() {
  let formattedContent = `<h1>${topic.value}</h1>`;
  sections.value.forEach((section, index) => {
    formattedContent += `<h2>${section.title}</h2>`;
    formattedContent += `<p>${contents.value[index] || ""}</p><br>`;
  });
  return formattedContent;
}

const updateContent = (newContent: string) => {
  fullEssayContent.value = newContent;
  // essayStore.updateFullContent(newContent);
};

const exportEssay = () => {
  // Implement export functionality here
  console.log("Exporting essay:", fullEssayContent.value);
};

const goBack = () => {
  router.push("/essay/v1/content");
};

onMounted(async () => {
  // Simulate an asynchronous operation (e.g., fetching data)
  await new Promise(resolve => setTimeout(resolve, 1000));

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
