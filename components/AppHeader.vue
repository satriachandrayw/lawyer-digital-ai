<script setup lang="ts">
import { ref } from 'vue'
import { useColorMode } from '@vueuse/core'

const colorMode = useColorMode()

const tabs = [
  { name: 'Home', href: '/' },
  { name: 'Upload Respon Gugatanmu', href: '/upload-respon-gugatanmu' }
]

const activeTab = ref(tabs[0])
</script>

<template>
  <header class="flex justify-between items-center p-4 bg-background">
    <nav>
      <ul class="flex space-x-4">
        <li v-for="tab in tabs" :key="tab.name">
          <NuxtLink
            :to="tab.href"
            :class="[
              'px-3 py-2 rounded-md text-sm font-medium',
              activeTab.name === tab.name
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            ]"
            @click="activeTab = tab"
          >
            {{ tab.name }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
    <Button @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'">
      <span v-if="colorMode.value === 'dark'">🌞</span>
      <span v-else>🌙</span>
    </Button>
  </header>
</template>