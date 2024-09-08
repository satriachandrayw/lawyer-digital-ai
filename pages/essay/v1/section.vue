<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-4">Editor Page</h1>
    <p class="text-xl mb-8 text-gray-600">Review and edit the main ideas below</p>
    <div class="mb-8 space-y-4">
      <template v-if="isLoading">
        <Skeleton v-for="i in 5" :key="i" class="h-10 w-full" />
      </template>
      <template v-else>
        <div v-for="(section, index) in sections" :key="section.title" class="flex items-start space-x-4">
          <div class="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {{ index + 1 }}
          </div>
          <div class="flex-grow">
            <template v-if="section.isRegenerating">
              <Skeleton class="h-6 w-[80%] mb-2" />
              <!-- <Skeleton class="h-4 w-[60%]" /> -->
            </template>
            <template v-else>
              <h2 class="text-xl font-bold" v-if="!section.editing">{{ section.title }}</h2>
              <Input v-else 
                v-model="section.editTitle" 
                @keyup.enter="updateSectionTitle(section)" 
                @blur="updateSectionTitle(section)" 
                class="flex-grow px-2 py-1 text-xl font-bold bg-transparent focus:outline-none focus:ring-0 text-left"
              />
              <p class="text-gray-600">{{ section.content }}</p>
            </template>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icon icon="radix-icons:gear" class="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @click="regenerateSection(index)">
                <Icon icon="radix-icons:update" class="mr-2 h-4 w-4" />
                <span>Regenerate</span>
              </DropdownMenuItem>
              <DropdownMenuItem @click="editOutline(section)">
                <Icon icon="radix-icons:pencil" class="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </template>
    </div>
    <div class="flex justify-between mt-4">
      <Button @click="goToIndex" variant="outline">Back</Button>
      <Button @click="goToEdit" v-if="!isAnyEditing && sections.length > 0">Next</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/vue';
import { useEssayStore } from '@/stores/essayStore';
import { storeToRefs } from 'pinia';

const router = useRouter();
const route = useRoute();
const essayStore = useEssayStore();
const { topic, documentType, sections } = storeToRefs(essayStore);

const isLoading = ref(false);

// Add the following new or modified functions:

const editOutline = (section) => {
  section.editing = true;
  section.editTitle = section.title;
  section.editContent = section.content;
};

const updateSectionTitle = async (section) => {
  if (section.editTitle && section.editTitle.trim() !== '') {
    section.title = section.editTitle.trim();
  }

  section.editing = false;
  await nextTick();
};

const regenerateSection = async (index: number) => {
  sections.value[index].isRegenerating = true; // Set the regenerating state for the selected section
  try {
    const response = await fetch('/api/essay/section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topic.value,
        documentType: documentType.value,
        sectionIndex: index,
        currentSections: sections.value.map(s => s.title),
      }),
    });

    if (response.ok) {
      const { essay } = await response.json();
      essayStore.updateSection(index, {
        ...sections.value[index],
        title: essay.section.title,
      });
    }
  } catch (error) {
    console.error('Error regenerating section:', error);
  } finally {
    sections.value[index].isRegenerating = false; // Reset the regenerating state
  }
};

// Modify the fetchOutline function to include content
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
      essayStore.setSections(essay.sections.map(section => ({ 
        ...section, 
        editing: false, 
        editTitle: section.title, 
        editContent: section.content,
        isRegenerating: false 
      })));
    }
  } catch (error) {
    console.error('Error fetching outline:', error);
  } finally {
    isLoading.value = false;
  }
};

const isAnyEditing = computed(() => sections.value.some(section => section.editing));

const goToEdit = () => {
  router.push(`/essay/v1/content`);
};

// New method to route back to index and clear sections
const goToIndex = () => {
  essayStore.clearSections();
  router.push('/essay/v1');
};

onMounted(() => {
  if (essayStore.sections.length === 0) {
    fetchOutline();
  } 
});


// Make sure to update your essayStore to handle the new 'content' field
</script>
