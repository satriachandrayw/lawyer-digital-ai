<template>
  <div class="flex flex-col items-center justify-center py-8 px-4">
    <h1 class="text-4xl font-bold mb-4">
      Essay Creator
    </h1>
    <p class="text-xl mb-8">
      Enter a topic and let's get started!
    </p>
    <div class="w-full max-w-md">
      <!-- Title suggestion -->
      <div v-if="suggestedTitle" class="mb-4 text-sm text-gray-600">
        Kami sarankan judulnya: 
        <span 
          class="text-blue-600 cursor-pointer hover:underline"
          @click="setTitle(suggestedTitle)"
        >
          {{ suggestedTitle }}
        </span>
      </div>
      <!-- Topic input for generating title suggestion -->
      <Input
        v-model="localTitle"
        placeholder="Enter your topic to get a title suggestion"
        class="w-full mb-4"
        @input="debouncedGetSuggestedTitle"
      />
      <div class="flex space-x-4 mb-6">
        <Select
          v-model="selectedLanguage"
          class="flex-none w-16"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                v-for="language in languages"
                :key="language.value"
                :value="language.value"
              >
                {{ language.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          v-model="selectedCharacteristic"
          class="flex-none w-18"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a characteristic" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                v-for="characteristic in characteristics"
                :key="characteristic.value"
                :value="characteristic.value"
              >
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
        class="w-full"
        :disabled="!title || !selectedLanguage || !selectedCharacteristic"
        @click="generateOutline"
      >
        Start
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'

import { Globe } from 'lucide-vue-next'
import { useEssayStore } from '@/stores/essayStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const router = useRouter()
const essayStore = useEssayStore()
const { essay: title } = storeToRefs(essayStore)

const localTitle = ref('')
const suggestedTitle = ref('')
const selectedLanguage = ref('')
const selectedCharacteristic = ref('')
const localUseWebSearch = ref(false)

const languages = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Indonesia' },
]
const characteristics = [
  { value: 'creative', label: 'Creative' },
  { value: 'analytical', label: 'Analytical' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'informative', label: 'Informative' },
  { value: 'descriptive', label: 'Descriptive' },
]

const getSuggestedTitle = async () => {
  if (localTitle.value) {
    try {
      const response = await $fetch('/api/essay/title', {
        method: 'POST',
        body: { 
          topic: localTitle.value,
          language: selectedLanguage.value,
          characteristic: selectedCharacteristic.value,
        },
      })
      suggestedTitle.value = response
    } catch (error) {
      console.error('Error fetching suggested title:', error)
    }
  }
}

const debouncedGetSuggestedTitle = useDebounceFn(getSuggestedTitle, 2000)

watch([selectedLanguage, selectedCharacteristic], () => {
  debouncedGetSuggestedTitle()
}, { immediate: false })

const setTitle = (newTitle: string) => {
  localTitle.value = newTitle
  suggestedTitle.value = ''
}

const generateOutline = async () => {
  if (localTitle.value && selectedLanguage.value && selectedCharacteristic.value) {
    try {
      // Clear any existing essay data
      essayStore.clearEssay()

      essayStore.setDocumentType('essay')
      essayStore.setTitle(localTitle.value) // Use title instead of topic
      essayStore.setLanguage(selectedLanguage.value)
      essayStore.setCharacteristic(selectedCharacteristic.value)
      essayStore.setUseWebSearch(localUseWebSearch.value)

      // Navigate to the section page
      router.push('/essay/section')
    }
    catch (error) {
      console.error('Error setting up essay:', error)
    }
  }
}

onMounted(() => {
  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo('/')
  }
})

definePageMeta({
  layout: 'apps',
})
</script>
