<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-4">Editor Page</h1>
    <p class="text-xl mb-8 text-gray-600">Review and edit the main ideas below</p>
    <div class="mb-8 space-y-4">
      <template v-if="isLoading">
        <Skeleton v-for="i in 5" :key="i" class="h-10 w-full" />
      </template>
      <template v-else>
        <div v-for="(section, index) in essay.sections" :key="section.title" class="flex items-start space-x-4">
          <div class="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {{ index + 1 }}
          </div>
          <div class="flex-grow">
            <template v-if="section.isRegenerating">
              <Skeleton class="h-6 w-[80%] mb-2" />
              <Skeleton class="h-4 w-[60%]" />
            </template>
            <template v-else>
              <h2 class="text-xl font-bold" v-if="!section.editing">{{ section.title }}</h2>
              <Input v-else 
                v-model="section.editTitle" 
                @keyup.enter="updateSectionTitle(section)" 
                @blur="updateSectionTitle(section)" 
                class="flex-grow px-2 py-1 text-xl font-bold bg-transparent focus:outline-none focus:ring-0 text-left"
              />
              <p class="text-gray-600">{{ section.description }}</p>
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
      <Button @click="goToEdit" v-if="!isAnyEditing && essay.sections.length > 0">Next</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, computed, ref } from 'vue';
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia';

import { Icon } from '@iconify/vue';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useEssayStore } from '@/stores/essayStore';

import type { Essay, Section } from '@/types/essay';

const router = useRouter();
const essayStore = useEssayStore();
const { essay, topic, documentType } = storeToRefs(essayStore) as { essay: Ref<Essay>, topic: Ref<string>, documentType: Ref<string> };

const isLoading = ref(false);

const editOutline = (section: Section) => {
  section.editing = true;
  section.editTitle = section.title;
};

const updateSectionTitle = async (section: Section) => {
  if (section.editTitle && section.editTitle.trim() !== '') {
    section.title = section.editTitle.trim();
  }
  section.editing = false;
  await nextTick();
};

const regenerateSection = async (index: number) => {
  essay.value.sections[index].isRegenerating = true;
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
        currentSections: essay.value.sections.map(s => s.title),
      }),
    });

    if (response.ok) {
      const { sections: responseSections } = await response.json();
      console.log(responseSections);
      
      essayStore.updateSection(index, {
        ...essay.value.sections[index],
        title: responseSections.title,
        description: responseSections.description,
      });
    }
  } catch (error) {
    console.error('Error regenerating section:', error);
  } finally {
    essay.value.sections[index].isRegenerating = false;
  }
};

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
      const { essay: responseEssay } = await response.json();
      essayStore.setTitle(responseEssay.title);
      essayStore.setSections(responseEssay.sections.map((section: Section) => ({ 
        ...section, 
        editing: false, 
        editTitle: section.title,
        isRegenerating: false 
      })));
    }
  } catch (error) {
    console.error('Error fetching outline:', error);
  } finally {
    isLoading.value = false;
  }
};

const isAnyEditing = computed(() => essay.value.sections.some(section => section.editing));

const goToEdit = () => {
  router.push(`/content`);
};

const goToIndex = () => {
  essayStore.clearEssay();
  router.push('/');
};

onMounted(() => {
  if (essay.value.sections.length === 0) {
    fetchOutline();
  } 
});
</script>
