<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-4xl font-bold mb-4">Essay Creator</h1>
    <p class="text-xl mb-8">Enter a topic and let's get started!</p>
    <div class="w-full max-w-md">
      <Input 
        v-model="topic" 
        placeholder="Enter your topic here" 
        class="w-full mb-4"
      />
      <Button 
        @click="generateSection" 
        class="w-full"
        :disabled="!topic"
      >
        Start
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useEssayStore } from '@/stores/essayStore';
import { storeToRefs } from 'pinia';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const router = useRouter();
const essayStore = useEssayStore();
const { topic } = storeToRefs(essayStore);

const generateSection = async () => {
  if (topic.value) {
    try {
      essayStore.setDocumentType('essay'); // Set default document type to 'essay'
      router.push(`/essay/v1/section`);
    } catch (error) {
      console.error('Error generating outline:', error);
    }
  }
};
</script>
