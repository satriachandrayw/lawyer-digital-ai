<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Edit Outline for: {{ topic }}</h1>
    <div v-for="(section, index) in sections" :key="index" class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-xl font-semibold">{{ section }}</h2>
        <Popover v-if="content[index]">
          <PopoverTrigger asChild>
            <button class="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <Icon icon="radix-icons:gear" class="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent class="w-56">
            <div class="flex flex-col space-y-2">
              <button @click="regenerateContent(index)" class="flex items-center px-4 py-2 bg-blue-500 text-white rounded">
                <span class="mr-2">🔄</span> Regenerate
              </button>
              <button @click="editContent(index)" class="flex items-center px-4 py-2 bg-green-500 text-white rounded">
                <span class="mr-2">✏️</span> Edit
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div v-if="!content[index] && !isProcessing[index]" class="p-4 border rounded">
        <button @click="generateContent(index)" class="btn">Generate Content</button>
      </div>
      <div v-else-if="isProcessing[index]" class="space-y-2">
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-[90%]" />
        <Skeleton class="h-4 w-[80%]" />
      </div>
      <div v-else class="p-4 border rounded whitespace-pre-wrap">
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@iconify/vue';

const route = useRoute();
const router = useRouter();
const essayStore = useEssayStore();
const { topic, sections } = storeToRefs(essayStore);

const content = ref<string[]>([]);
const isProcessing = ref<boolean[]>([]);

// Use the completion hook at the top level
const { complete, completion, error, isLoading } = useCompletion({
  api: '/api/essay/content',
  streamProtocol: 'text',
  onResponse: (response) => {
    console.log(response);
    
    const currentIndex = response.body.index;
    isProcessing.value[currentIndex] = true;
    console.log(`Received response for section ${currentIndex}`);
  }
});

onMounted(() => {
  if (route.query.topic) {
    essayStore.setTopic(route.query.topic as string);
  }
  if (route.query.outline) {
    const outline = JSON.parse(route.query.outline as string);
    essayStore.setSections(outline);
    content.value = new Array(outline.length).fill('');
    isProcessing.value = new Array(outline.length).fill(false);
  }
});

const generateContent = async (index: number) => {
  if (isProcessing.value[index]) return; // Prevent multiple generations for the same section

  isProcessing.value[index] = true;
  content.value[index] = ''; // Clear existing content

  try {
    await complete(sections.value[index], {
      body: { topic: topic.value, index }
    });

    if (error.value) {
      throw new Error(error.value.message);
    }

    try {
      const parsedCompletion = JSON.parse(completion.value);
      content.value[index] = parsedCompletion.essay.section.content;
    } catch (parseError) {
      console.error('Error parsing completion:', parseError);
      content.value[index] = completion.value; // Use raw completion if parsing fails
    }
  } catch (error) {
    console.error(`Error generating content for section ${index + 1}:`, error);
    content.value[index] = 'Error generating content';
  } finally {
    isProcessing.value[index] = false;
  }
};

const goBack = () => {
  router.push('/essay/section');
};

const exportEssay = () => {
  // Logic to export content
};

const regenerateContent = async (index: number) => {
  await generateContent(index);
  console.log(`Regenerating content for section ${index}`);
};

const editContent = (index: number) => {
  // TODO: Implement edit logic
  console.log(`Editing content for section ${index}`);
};
</script>

<style scoped>
.btn {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors;
}

:deep(.popover-content) {
  z-index: 50;
}
</style>
