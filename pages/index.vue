<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-4xl font-bold mb-4">Essay Creator</h1>
    <p class="text-xl mb-8">Enter a topic and let's get started!</p>
    <div class="w-full max-w-md">
      <Input 
        v-model="localTopic" 
        placeholder="Enter your topic here" 
        class="w-full mb-4"
      />
      <Button 
        @click="generateOutline" 
        class="w-full"
        :disabled="!localTopic"
      >
        Start
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useEssayStore } from '@/stores/essayStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const router = useRouter();
const essayStore = useEssayStore();
const { topic } = storeToRefs(essayStore);

const localTopic = ref(topic.value);

const generateOutline = async () => {
  if (localTopic.value) {
    try {
      // Clear any existing essay data
      essayStore.clearEssay();

      essayStore.setDocumentType('essay');
      essayStore.setTopic(localTopic.value);
      
      // Navigate to the section page
      router.push('/section');
    } catch (error) {
      console.error('Error setting up essay:', error);
    }
  }
};
</script>
