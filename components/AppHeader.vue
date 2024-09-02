<script setup lang="ts">
import { ref, computed } from 'vue'
import { useColorMode } from '@vueuse/core'
import { useRoute } from 'vue-router'

const colorMode = useColorMode()
const route = useRoute()

const tabs = [
  { name: 'Home', href: '/' },
  { name: 'Upload Respon Gugatanmu', href: '/upload-respon-gugatanmu' },
  { name: 'Journal Creator', href: '/essay' }
]

const activeTab = computed(() => {
  return tabs.find(tab => tab.href === route.path) || tabs[0]
})

const toggleColorMode = () => {
  colorMode.store.value = colorMode.value === 'dark' ? 'light' : 'dark'
}
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
              activeTab.href === tab.href
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            ]"
          >
            {{ tab.name }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
    <Button @click="toggleColorMode">
      <span v-if="colorMode.value === 'dark'">🌞</span>
      <span v-else>🌙</span>
    </Button>
  </header>
</template>