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
        <Select v-model="selectedCharacteristic" class="flex-none w-18">
          <SelectTrigger>
            <SelectValue placeholder="Select a characteristic" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="characteristic in characteristics" :key="characteristic.value" :value="characteristic.value">
                {{ characteristic.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center space-x-2 mb-6">
        <Globe class="h-5 w-5 text-gray-500" />
        <span class="mr-2">Search on the web</span>
        <Switch 
        v-model:checked="localUseWebSearch"
        />
      </div>
      <Button 
        @click="generateOutline" 
        class="w-full"
        :disabled="!localTopic || !selectedLanguage || !selectedCharacteristic"
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
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Globe } from 'lucide-vue-next';

const router = useRouter();
const essayStore = useEssayStore();
const { topic } = storeToRefs(essayStore);

const localTopic = ref(topic.value);
const selectedLanguage = ref('');
const selectedCharacteristic = ref('');
const localUseWebSearch = ref(false);

const languages = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Indonesia' },
];
const characteristics = [
  { value: 'creative', label: 'Creative' },
  { value: 'analytical', label: 'Analytical' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'informative', label: 'Informative' },
  { value: 'descriptive', label: 'Descriptive' },
];

const generateOutline = async () => {
  if (localTopic.value && selectedLanguage.value && selectedCharacteristic.value) {
    try {
      // Clear any existing essay data
      essayStore.clearEssay();

      essayStore.setDocumentType('essay');
      essayStore.setTopic(localTopic.value);
      essayStore.setLanguage(selectedLanguage.value);
      essayStore.setCharacteristic(selectedCharacteristic.value);
      essayStore.setUseWebSearch(localUseWebSearch.value);
      
      // Navigate to the section page
      router.push('/essay/section');
    } catch (error) {
      console.error('Error setting up essay:', error);
    }
  }
};

onMounted(() => {
  const user = useSupabaseUser()
  console.log(user.value);
  
  if (!user.value) {
    return navigateTo('/')
  }
})
</script>
