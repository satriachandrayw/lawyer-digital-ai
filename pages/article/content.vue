<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl font-bold">Drafting Article</h1>
      <Button @click="generateArticle" variant="outline">Generate Article</Button>
    </div>
    <div class="mb-8 space-y-4">
      <div class="rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center">
          <div class="flex-grow">
            <h2 v-if="!localArticle.isTitleProcessing && !localArticle.editing" class="text-xl font-bold mb-2">
              {{ localArticle.title }}
            </h2>
            <Input 
              v-if="localArticle.editing" 
              v-model="localArticle.editTitle" 
              @keyup.enter="updateArticleTitle" 
              @blur="updateArticleTitle" 
              class="flex-grow px-2 py-1 text-xl font-bold bg-transparent focus:outline-none focus:ring-0 text-left"
            />
            <div v-if="localArticle.isTitleProcessing" class="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
          </div>
          <DropdownMenu v-if="localArticle.content">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icon icon="radix-icons:gear" class="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @click="regenerateTitle">
                <Icon icon="radix-icons:update" class="mr-2 h-4 w-4" />
                <span>Regenerate Title</span>
              </DropdownMenuItem>
              <DropdownMenuItem @click="editArticle">
                <Icon icon="radix-icons:pencil" class="mr-2 h-4 w-4" />
                <span>Edit Title</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div class="mt-4 mb-4">
          <Button v-if="!localArticle.isTitleProcessing && !localArticle.title" @click="generateTitle" variant="outline" class="mb-4">Generate Title</Button>
        </div>
        <div class="p-4 border rounded">
          <div v-if="!localArticle.content && !localArticle.isContentProcessing" class="space-y-2">
            <Button @click="generateArticle" variant="outline">
              <Icon icon="radix-icons:update" class="w-5 h-5 mr-2" />
              Generate Content
            </Button>
          </div>
          <div v-else-if="localArticle.isContentProcessing" class="space-y-2">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-[90%]" />
            <Skeleton class="h-4 w-[80%]" />
          </div>
          <div v-else class="whitespace-pre-wrap">
            {{ localArticle.content }}
          </div>
        </div>
        <div class="mt-4 flex justify-end space-x-2" v-if="localArticle.content">
          <Button @click="regenerateContent" variant="outline" size="sm">
            <Icon icon="radix-icons:update" class="w-4 h-4 mr-2" />
            Regenerate Content
          </Button>
        </div>
      </div>
    </div>
    <div class="flex justify-between mt-6">
      <Button @click="goBack" variant="outline">Back</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useCompletion } from '@ai-sdk/vue';
import { parse } from 'partial-json';

import { useNewsStore } from '@/stores/newsStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/vue';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const router = useRouter();
const newsStore = useNewsStore();
const { news, topic, language, newsType } = storeToRefs(newsStore);

const localArticle = ref({
  title: news.value.title,
  editTitle: news.value.title,
  content: '',
  isTitleProcessing: false,
  isContentProcessing: false,
  editing: false,
});

const { complete, completion, error } = useCompletion({
  api: '/api/article/content',
  streamProtocol: 'text',
  onResponse: (response: Response) => {
    console.log(`Received response onResponse`);
  }
});

onMounted(() => {
  localArticle.value.isTitleProcessing = false;
  localArticle.value.isContentProcessing = false;
});

const updateLocalArticle = (parsedData: any) => {
  if (parsedData?.title) {
    localArticle.value.title = parsedData.title;
    localArticle.value.isTitleProcessing = false;
  }
  if (parsedData?.content) {
    localArticle.value.content = parsedData.content;
    localArticle.value.isContentProcessing = false;
  }
};

const generateTitle = async () => {
  if (localArticle.value.isTitleProcessing) return; 

  localArticle.value.isTitleProcessing = true;
  localArticle.value.title = ''; 

  try {
    await complete(localArticle.value.title, {
      body: { 
        topic: topic.value,
        language: language.value,
        newsType: newsType.value,
        generateType: 'title'
      }
    });

    if (error.value) {
      throw new Error(error.value.message);
    }

    // The title will be updated by the watcher
  } catch (error) {
    console.error(`Error generating title:`, error);
    localArticle.value.title = 'Error generating title';
    localArticle.value.isTitleProcessing = false;
  }
};

const generateContent = async () => {
  if (localArticle.value.isContentProcessing) return; 

  localArticle.value.isContentProcessing = true;
  localArticle.value.content = ''; 

  try {
    await complete(localArticle.value.title, {
      body: { 
        topic: topic.value,
        language: language.value,
        newsType: newsType.value,
        generateType: 'content'
      }
    });

    if (error.value) {
      throw new Error(error.value.message);
    }

    // The content will be updated by the watcher
  } catch (error) {
    console.error(`Error generating article:`, error);
    localArticle.value.content = 'Error generating content';
    localArticle.value.isContentProcessing = false;
  }
};

const generateArticle = async () => {
  if (localArticle.value.isContentProcessing) return; 

  localArticle.value.isContentProcessing = true;
  localArticle.value.isTitleProcessing = true;
  localArticle.value.title = '';
  localArticle.value.content = ''; 

  try {
    await complete(localArticle.value.title, {
      body: { 
        topic: topic.value,
        language: language.value,
        newsType: newsType.value,
        generateType: 'structure'
      }
    });

    if (error.value) {
      throw new Error(error.value.message);
    }

    // The content will be updated by the watcher
  } catch (error) {
    console.error(`Error generating article:`, error);
    localArticle.value.content = 'Error generating content';
    localArticle.value.isContentProcessing = false;
    localArticle.value.isTitleProcessing = false;
  }
};

const goBack = () => {
  newsStore.clearNews();  
  router.push('/article');
};

const regenerateTitle = async () => {
  await generateTitle();
  console.log(`Regenerating title`);
};

const regenerateContent = async () => {
  await generateContent();
  console.log(`Regenerating content`);
};

const editArticle = () => {
  localArticle.value.editing = true;
  localArticle.value.editTitle = localArticle.value.title; // Set the edit title to current title
};

const updateArticleTitle = () => {
  if (localArticle.value.editTitle && localArticle.value.editTitle.trim() !== '') {
    localArticle.value.title = localArticle.value.editTitle.trim();
  }
  localArticle.value.editing = false; // Exit editing mode
};

// Update this watcher to handle streaming updates
watch(completion, (newCompletion) => {
  if (newCompletion) {
    try {
      const parsedData = parse(newCompletion);
      updateLocalArticle(parsedData);
    } catch (e) {
      console.error('Error parsing streaming data:', e);
    }
  }
});
</script>
