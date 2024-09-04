<template>
  <div class="flex justify-center h-screen">
    <div class="text-center">
      <h1 class="text-3xl font-bold mb-6">Tulis topik yang ingin kamu jadikan essay atau jurnal</h1>
      <Input v-model="topic" placeholder="Tulis topik/judul kamu disini" class="input mx-auto mb-4" />
      <div class="flex justify-center mt-4">
        <Radio id="essay" name="documentType" value="essay" v-model="documentType" label="Essay" class="mr-4" />
        <Radio id="journal" name="documentType" value="journal" v-model="documentType" label="Journal" />
      </div>
      <Button @click="generateSection" class="btn mt-4 mx-auto">Generate Section</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Input from '@/components/ui/input/Input.vue';
import Button from '@/components/ui/button/Button.vue';
import { Radio } from '@/components/ui/radio';
import { useEssayStore } from '@/stores/essayStore';
import { storeToRefs } from 'pinia';

const router = useRouter();
const essayStore = useEssayStore();
const { topic, documentType } = storeToRefs(essayStore);

const generateSection = async () => {
  if (topic.value && documentType.value) {
    try {  
      router.push(`/essay/section?topic=${topic.value}&documentType=${documentType.value}`);
    } catch (error) {
      console.error('Error generating outline:', error);
    }
  }
};
</script>

<style scoped>
.input { @apply p-2 border rounded; }
.btn { @apply p-2 bg-blue-500 text-white rounded; }
</style>
