<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl font-bold">{{ essay.title }}</h1>
      <Button @click="regenerateAll" variant="outline">Generate All</Button>
    </div>
    <div class="mb-8 space-y-4">
      <div v-for="(section, index) in essay.sections" :key="index" class="rounded-lg shadow-md p-6">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
            {{ index + 1 }}
          </div>
          <div class="flex-grow">
            <h2 class="text-xl font-bold mb-2">{{ section.title }}</h2>
            <div class="p-4 border rounded">
              <div v-if="!section.content && !section.isProcessing" class="space-y-2">
                <Button @click="generateContent(index)" variant="outline">
                  <Icon icon="radix-icons:update" class="w-5 h-5 mr-2" />
                  Generate Content
                </Button>
              </div>
              <div v-else-if="section.isProcessing" class="space-y-2">
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-[90%]" />
                <Skeleton class="h-4 w-[80%]" />
              </div>
              <div v-else class="whitespace-pre-wrap">
                {{ section.content }}
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4 flex justify-end space-x-2" v-if="section.content">
          <Button @click="regenerateContent(index)" variant="outline" size="sm">
            <Icon icon="radix-icons:update" class="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </div>
    </div>
    <div class="flex justify-between mt-6">
      <Button @click="goBack" variant="outline">Back</Button>
      <div class="flex space-x-2">
        <div class="w-[100px]">
          <Button 
            @click="composeEssay" 
            v-if="allContentsGenerated"
            class="w-full"
          >
            Compose
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useCompletion } from '@ai-sdk/vue';

import { useEssayStore } from '@/stores/essayStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/vue';

import type { Essay } from '@/types/essay';

const router = useRouter();
const essayStore = useEssayStore();
const { essay, topic } = storeToRefs(essayStore) as { essay: Ref<Essay>, topic: Ref<string> };

const { complete, completion, error } = useCompletion({
  api: '/api/essay/content',
  streamProtocol: 'text',
  onResponse: (response: Response) => {
    console.log(`Received response onResponse`);
  }
});

onMounted(() => {
  essay.value.sections.forEach(section => {
    section.isProcessing = false;
  });
});

const generateContent = async (index: number) => {
  if (essay.value.sections[index].isProcessing) return; 

  essay.value.sections[index].isProcessing = true;
  essay.value.sections[index].content = ''; 

  try {
    await complete(essay.value.sections[index].title, {
      body: { topic: topic.value, index }
    });

    if (error.value) {
      throw new Error(error.value.message);
    }

    try {
      const {content} = JSON.parse(completion.value);
      essay.value.sections[index].content = content;
      essayStore.updateSection(index, { content: essay.value.sections[index].content });
    } catch (parseError) {
      console.error('Error parsing completion:', parseError);
      essay.value.sections[index].content = completion.value;
      essayStore.updateSection(index, { content: essay.value.sections[index].content });
    }
  } catch (error) {
    console.error(`Error generating content for section ${index + 1}:`, error);
    essay.value.sections[index].content = 'Error generating content';
  } finally {
    essay.value.sections[index].isProcessing = false;
  }
};

const goBack = () => {
  essayStore.clearContents();  
  router.push('/section');
};

const composeEssay = () => {
  router.push('/compose');
};

const regenerateContent = async (index: number) => {
  await generateContent(index);
  console.log(`Regenerating content for section ${index}`);
};

const regenerateAll = async () => {
  await Promise.all(essay.value.sections.map((_, index) => generateContent(index)));
};

const allContentsGenerated = computed(() => 
  essay.value.sections.length > 0 && 
  essay.value.sections.every(section => section.content && section.content.trim() !== '')
);
</script>
