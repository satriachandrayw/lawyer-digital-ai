<template>
  <div class="container mx-auto px-4">
    <h1 class="text-2xl font-bold mb-4">Outline for: {{ topic }}</h1>
    <div class="mb-8">
      <template v-if="isLoading">
        <LoadingSpinner />
      </template>
      <template v-else>
        <ul class="list-disc pl-5">
          <li v-for="section in sections" :key="section.title" class="mb-2">
            {{ section.title }}
            <Tooltip>
              <template #content>
                <div class="flex flex-col space-y-2">
                  <button @click="regenerateOutline" class="px-4 py-2 bg-blue-500 text-white rounded">Regenerate</button>
                  <button @click="editOutline" class="px-4 py-2 bg-green-500 text-white rounded">Edit</button>
                </div>
              </template>
              <span class="cursor-pointer">Hover for options</span>
            </Tooltip>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoadingSpinner from '@/components/ui/loading-spinner/LoadingSpinner.vue';
import Tooltip from '@shadcn/ui/Tooltip'; // Import the Shadcn UI Tooltip component

const router = useRouter();
const route = useRoute();
const topic = ref(route.query.topic as string);
const documentType = ref(route.query.documentType as string);
const sections = ref<{ title: string }[]>([]); // Ensure sections is an array of objects with title
const isLoading = ref(false);

const fetchOutline = async () => {
  isLoading.value = true;
  try {
    const response = await fetch('/api/essay/structure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic: topic.value, documentType: documentType.value }),
    });

    if (response.ok) {
      const { essay } = await response.json(); // Ensure you destructure the essay object
      sections.value = essay.sections; // Assign sections from the essay object
    }
  } catch (error) {
    console.error('Error fetching outline:', error);
  } finally {
    isLoading.value = false;
  }
};

const regenerateOutline = async () => {
  await fetchOutline();
};

const editOutline = () => {
  router.push({ name: 'edit', query: { topic: topic.value, outline: JSON.stringify(sections.value) } });
};

onMounted(fetchOutline);
</script>

<style scoped>
.btn { @apply p-2 bg-blue-500 text-white rounded; }
</style>
