<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Edit Outline for: {{ topic }}</h1>
    <div v-for="(section, index) in sections" :key="index" class="mb-6">
      <h2 class="text-xl font-semibold mb-2">{{ section }}</h2>
      <div v-if="!content[index] && !isGenerating[index]" class="p-4 border rounded">
        <button @click="generateContent(index)" class="btn">Generate Content</button>
      </div>
      <div v-else-if="isGenerating[index]" class="space-y-2">
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-[90%]" />
        <Skeleton class="h-4 w-[80%]" />
      </div>
      <div v-else class="p-4 border rounded">
        {{ content[index] }}
      </div>
    </div>
    <div class="flex justify-between mt-6">
      <button @click="goBack" class="btn">Back</button>
      <button @click="exportEssay" class="btn">Export</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCompletion } from '@ai-sdk/vue'
import { useEssayStore } from '@/stores/essayStore';
import { storeToRefs } from 'pinia';
import { Skeleton } from '@/components/ui/skeleton';

const route = useRoute();
const router = useRouter();
const essayStore = useEssayStore();
const { topic, sections } = storeToRefs(essayStore);

const content = ref<string[]>([]);
const isGenerating = ref<boolean[]>([]);

// Use the completion hook at the top level
const { complete, completion, error } = useCompletion({
  api: '/api/essay/content',
  streamProtocol: 'text',
  onResponse: (response) => {
    console.log('Received response from API');
  },
  onFinish: (prompt, completion) => {
    console.log('AI processing finished');
  },
});

onMounted(() => {
  if (route.query.topic) {
    essayStore.setTopic(route.query.topic as string);
  }
  if (route.query.outline) {
    const outline = JSON.parse(route.query.outline as string);
    essayStore.setSections(outline);
    content.value = new Array(outline.length).fill('');
    isGenerating.value = new Array(outline.length).fill(false);
  }
});

const generateContent = async (index: number) => {
  if (isGenerating.value[index]) return; // Prevent multiple generations for the same section

  isGenerating.value[index] = true;
  
  try {
    let accumulatedCompletion = '';
    
    await complete(sections.value[index], {
      body: { topic: topic.value, index }
    });

    if (error.value) {
      throw new Error(error.value.message);
    }

    try {
      console.log(completion.value);
      
      const parsedCompletion = JSON.parse(completion.value);
      content.value[index] = parsedCompletion.essay.section.content;
    } catch (parseError) {
      console.error('Error parsing completion:', parseError);
      // If parsing fails, use the raw accumulated completion
      content.value[index] = accumulatedCompletion;
    }
  } catch (error) {
    console.error(`Error generating content for section ${index + 1}:`, error);
    content.value[index] = 'Error generating content';
  } finally {
    isGenerating.value[index] = false;
  }
};

const goBack = () => {
  router.push('/essay/section');
};

const exportEssay = () => {
  // Logic to export content
};
</script>

<style scoped>
.btn {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors;
}
</style>
