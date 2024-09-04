<template>
  <div class="container mx-auto px-4">
    <h1 class="text-3xl font-bold mb-4">Outline for: {{ topic }}</h1>
    <div class="mb-8">
      <template v-if="isLoading">
        <LoadingSpinner />
      </template>
      <template v-else>
        <ul class="list-disc pl-5">
          <li
            v-for="section in sections"
            :key="section.title"
            class="mb-2 text-2xl font-bold cursor-pointer hover:text-primary flex items-center justify-between"
          >
            <span v-if="!section.editing" class="flex-grow">
              {{ section.title }}
            </span>
            <input
              v-else
              v-model="section.editTitle"
              @keyup.enter="updateSectionTitle(section)"
              @blur="updateSectionTitle(section)"
              class="flex-grow px-2 py-1 text-2xl font-bold bg-transparent focus:outline-none focus:ring-0 border-none text-left"
              :ref="el => { if (el) el.focus() }"
            />
            <Popover>
              <PopoverTrigger asChild>
                <button class="ml-2 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <Icon icon="radix-icons:gear" class="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent class="w-56">
                <div class="flex flex-col space-y-2">
                  <!-- <button @click="regenerateOutline" class="flex items-center px-4 py-2 bg-blue-500 text-white rounded">
                    <span class="mr-2">🔄</span> Regenerate
                  </button> -->
                  <button @click="editOutline(section)" class="flex items-center px-4 py-2 bg-green-500 text-white rounded">
                    <span class="mr-2">✏️</span> Edit
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </li>
        </ul>
      </template>
    </div>
    <div class="flex justify-end mt-4" v-if="!isAnyEditing && sections.length > 0">
      <button @click="goToEdit" class="btn">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoadingSpinner from '@/components/ui/loading-spinner/LoadingSpinner.vue';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@iconify/vue';

const router = useRouter();
const route = useRoute();
const topic = ref(route.query.topic as string);
const documentType = ref(route.query.documentType as string);
const sections = ref<{ title: string; editing?: boolean; editTitle?: string }[]>([]);
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
      const { essay } = await response.json();
      sections.value = essay.sections.map(section => ({ ...section, editing: false, editTitle: section.title }));
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

const isAnyEditing = computed(() => sections.value.some(section => section.editing));

const editOutline = (section: { title: string; editing?: boolean; editTitle?: string }) => {
  section.editing = true;
  section.editTitle = section.title;
};

const updateSectionTitle = async (section: { title: string; editing?: boolean; editTitle?: string }) => {
  if (section.editTitle && section.editTitle.trim() !== '') {
    section.title = section.editTitle.trim();
  }
  section.editing = false;

  // Force re-render of the component
  await nextTick();
};

const goToEdit = () => {
  const outline = JSON.stringify(sections.value.map(section => section.title));
  router.push(`/essay/edit?topic=${topic.value}&outline=${outline}`);
};

onMounted(fetchOutline);
</script>

<style scoped>
.btn { @apply p-2 bg-blue-500 text-white rounded; }

:deep(.popover-content) {
  z-index: 50;
}
</style>
