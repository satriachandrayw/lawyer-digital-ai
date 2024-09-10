<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-4">Editor Page</h1>
    <p class="text-xl mb-8 text-gray-600">Review and edit the main ideas below</p>
    <div class="mb-8 space-y-4">
      <template v-if="isLoading">
        <Skeleton v-for="i in 5" :key="i" class="h-10 w-full" />
      </template>
      <template v-else-if="localEssay?.sections?.length">
        <div 
        v-for="(section, index) in localEssay.sections" 
        :key="section.title" class="flex items-start space-x-4" >
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
      <template v-else>
        <p>No sections available.</p>
      </template>
    </div>
    <div class="flex justify-between mt-4">
      <Button @click="goToIndex" variant="outline">Back</Button>
      <Button @click="goToEdit" v-if="!isAnyEditing && !isAnyRegenerating && localEssay.sections.length > 0">Next</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia';
import { useCompletion } from '@ai-sdk/vue';
import { parse } from 'partial-json';

import { Icon } from '@iconify/vue';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { useEssayStore } from '@/stores/essayStore';

import type { Essay, Section } from '@/types/essay';

const router = useRouter();
const essayStore = useEssayStore();

const { essay, topic, documentType, language, characteristic } = storeToRefs(essayStore) as { essay: Ref<Essay>, topic: Ref<string>, documentType: Ref<string>, language: Ref<string>, characteristic: Ref<string> };

const localEssay = ref<Essay>(essayStore.essay);
const localTopic = ref(essayStore.topic);
const localDocumentType = ref(essayStore.documentType);

const isLoading = ref(false);

const { complete: completeStructure, completion: completionStructure, error: errorStructure } = useCompletion({
  api: '/api/essay/structure',
  streamProtocol: 'text',
  onResponse: (response: Response) => {
    isLoading.value = false;
  },
  // onFinish: (message: string) => {
  //   // The final message should already be a complete JSON object
  //   try {
  //     const parsedData = JSON.parse(message);
  //     updateLocalEssay(parsedData);
  //   } catch (e) {
  //     console.error('Error parsing final message:', e);
  //   }
  // }
});

const updateLocalEssay = (parsedData: any) => {
  if (parsedData.essay) {
    localEssay.value = {
      ...localEssay.value,
      title: parsedData.essay.title || localEssay.value.title,
      sections: parsedData.essay.sections?.map((section: Section) => ({
        ...section,
        editing: false,
        editTitle: section.title,
        isRegenerating: false
      })) || localEssay.value.sections
    };
  }
  if (parsedData.sections?.index) {
    console.log(parsedData.sections);
  
    localEssay.value.sections[parsedData.sections.index - 1] = {
    // ...localEssay.value.sections[parsedData.sections.index - 1],
    ...parsedData.sections,
    editing: false,
    editTitle: parsedData.sections.title,
    isRegenerating: false
    };
  }
};

const { complete: completeSection, 
  completion: completionSection, 
  error: errorSection, 
  isLoading: isLoadingSection } = useCompletion({
  api: '/api/essay/section',
  streamProtocol: 'text',
  onResponse: (response: Response) => {
    console.log(`Received response onResponse`);
  }
});

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

const fetchSection = async () => {
  isLoading.value = true;
  try {
    await completeStructure(localTopic.value, {
      body: { 
        documentType: localDocumentType.value, 
        language: language.value, 
        characteristic: characteristic.value 
      }
    });

    if (errorStructure.value) {
      throw new Error(errorStructure.value.message);
    }

  } catch (error) {
    console.error('Error fetching outline:', error);
  } finally {
    isLoading.value = false;
  }
};

const regenerateSection = async (index: number) => {
  localEssay.value.sections[index].isRegenerating = true;
  try {
    await completeSection(localTopic.value, {
      body: { 
        documentType: localDocumentType.value,
        language: language.value, 
        characteristic: characteristic.value, 
        sectionIndex: index, 
        currentSections: localEssay.value.sections.map(s => s.title) 
      }
    });

    if (errorSection.value) {
      throw new Error(errorSection.value.message);
    }

    // if(completionSection.value) {
    //   const { sections: responseSections } = JSON.parse(completionSection.value);
    //   localEssay.value.sections[index].isRegenerating = false;
    //   localEssay.value.sections[index].title = responseSections.title;
    //   localEssay.value.sections[index].description = responseSections.description;  
    // }
  } catch (error) {
    console.error('Error regenerating section:', error);
  } finally {

  }
};

const isAnyEditing = computed(() => localEssay.value.sections.some(section => section.editing));
const isAnyRegenerating = computed(() => localEssay.value.sections.some(section => section.isRegenerating));


const goToEdit = () => {
  essay.value = localEssay.value;
  topic.value = localTopic.value;
  documentType.value = localDocumentType.value;

  router.push(`/content`);
};

const goToIndex = () => {
  essayStore.clearEssay();
  router.push('/');
};

// Update this watcher to handle streaming updates
watch(completionStructure, (newCompletionStructure) => {
  if (newCompletionStructure) {
    try {
      const parsedData = parse(newCompletionStructure);
      updateLocalEssay(parsedData);
    } catch (e) {
      console.error('Error parsing streaming data:', e);
    }
  }
});

watch(completionSection, (newCompletionSection) => {
  if (newCompletionSection) {
    try {
      const parsedData = parse(newCompletionSection);
      updateLocalEssay(parsedData);
    } catch (e) {
      console.error('Error parsing streaming data:', e);
    }
  }
});

onMounted(() => {
  if (essay.value.sections.length === 0) {
    fetchSection();
  } 
});
</script>
