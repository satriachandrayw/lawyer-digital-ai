<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-4xl font-bold mb-4">News Article Generator</h1>
    <p class="text-xl mb-8">Enter a topic for your news article</p>
    <div class="w-full max-w-md">
      <Input 
        v-model="localTopic" 
        placeholder="Enter your news topic here" 
        class="w-full mb-4"
      />
      <div class="flex space-x-4 mb-6">
        <Select v-model="selectedLanguage" class="flex-none w-16">
          <SelectTrigger>
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="language in languages" :key="language.value" :value="language.value">
                {{ language.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select v-model="selectedNewsType" class="flex-none w-18">
          <SelectTrigger>
            <SelectValue placeholder="Select news type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="newsType in newsTypes" :key="newsType.value" :value="newsType.value">
                {{ newsType.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Button 
        @click="generateNewsArticle" 
        class="w-full"
        :disabled="!localTopic || !selectedLanguage || !selectedNewsType"
      >
        Generate News Article
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useNewsStore } from '@/stores/newsStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from '@/components/ui/select';

const router = useRouter();
const newsStore = useNewsStore();
const { topic } = storeToRefs(newsStore);

const localTopic = ref(topic.value);
const selectedLanguage = ref('');
const selectedNewsType = ref('');

const languages = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Indonesia' },
];
const newsTypes = [
  { value: 'breaking', label: 'Breaking News' },
  { value: 'feature', label: 'Feature Article' },
  { value: 'opinion', label: 'Opinion Piece' },
  { value: 'investigative', label: 'Investigative Report' },
  { value: 'legal', label: 'Legal News' },
];

const generateNewsArticle = async () => {
  if (localTopic.value && selectedLanguage.value && selectedNewsType.value) {
    try {
      // Clear any existing news data
      newsStore.clearNews();

      newsStore.setTopic(localTopic.value);
      newsStore.setLanguage(selectedLanguage.value);
      newsStore.setNewsType(selectedNewsType.value);
      
      // Navigate to the news generation page
      router.push('/generate-news');
    } catch (error) {
      console.error('Error setting up news article:', error);
    }
  }
};
</script>