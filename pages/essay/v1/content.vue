<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-4">Editor's Picks</h1>
    <div class="mb-8 space-y-4">
      <div v-for="(section, index) in sections" :key="index" class="rounded-lg shadow-md p-6">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
            {{ index + 1 }}
          </div>
          <div class="flex-grow">
            <h2 class="text-xl font-bold mb-2">{{ section.title }}</h2>
            <div class="p-4 border rounded">
              <div v-if="!content[index] && !isProcessing[index]" class="space-y-2">
                <Button @click="generateContent(index)" variant="outline">
                  <Icon icon="radix-icons:update" class="w-5 h-5 mr-2" />
                  Generate Content
                </Button>
              </div>
              <div v-else-if="isProcessing[index]" class="space-y-2">
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-[90%]" />
                <Skeleton class="h-4 w-[80%]" />
              </div>
              <div v-else class="whitespace-pre-wrap">
                {{ content[index] }}
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4 flex justify-end space-x-2">
          <Button @click="regenerateContent(index)" variant="outline" size="sm">
            <Icon icon="radix-icons:update" class="w-4 h-4 mr-2" />
            Regenerate
          </Button>
          <Button @click="editContent(index)" variant="outline" size="sm">
            <Icon icon="radix-icons:pencil" class="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>
    </div>
    <div class="flex justify-between mt-6">
      <Button @click="goBack" variant="outline">Back</Button>
      <Button @click="regenerateAll" variant="outline">Regenerate All</Button>
      <Button @click="composeEssay">Compose</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCompletion } from '@ai-sdk/vue';
import { useEssayStore } from '@/stores/essayStore';
import { storeToRefs } from 'pinia';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/vue';

const route = useRoute();
const router = useRouter();
const essayStore = useEssayStore();
const { topic, sections, contents } = storeToRefs(essayStore);

const content = ref<string[]>([]);
const isProcessing = ref<boolean[]>([]);

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
  content.value = new Array(sections.value.length).fill('');
  isProcessing.value = new Array(sections.value.length).fill(false);
});

const generateContent = async (index: number) => {
  if (isProcessing.value[index]) return; // Prevent multiple generations for the same section

  isProcessing.value[index] = true;
  content.value[index] = ''; // Clear existing content

  try {
    await complete(sections.value[index].title, {
      body: { topic: topic.value, index }
    });

    if (error.value) {
      throw new Error(error.value.message);
    }

    try {
      const parsedCompletion = JSON.parse(completion.value);
      content.value[index] = parsedCompletion.essay.section.content;
      essayStore.updateContent(index, content.value[index]); // Save content to the store
    } catch (parseError) {
      console.error('Error parsing completion:', parseError);
      content.value[index] = completion.value; // Use raw completion if parsing fails
      essayStore.updateContent(index, content.value[index]); // Save raw content to the store
    }
  } catch (error) {
    console.error(`Error generating content for section ${index + 1}:`, error);
    content.value[index] = 'Error generating content';
  } finally {
    isProcessing.value[index] = false;
  }
};


const goBack = () => {
  router.push('/essay/v1/section');
  essayStore.clearContents();
};

const composeEssay = () => {
  router.push('/essay/v1/compose');
};

const regenerateContent = async (index: number) => {
  await generateContent(index);
  console.log(`Regenerating content for section ${index}`);
};

const editContent = (index: number) => {
  // TODO: Implement edit logic
  console.log(`Editing content for section ${index}`);
};

const regenerateAll = async () => {
  await Promise.all(sections.value.map((_, index) => generateContent(index)));
};
</script>
