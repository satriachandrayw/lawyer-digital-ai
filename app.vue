<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col">
    <main class="flex-grow flex items-center justify-center">
      <div class="absolute top-8 right-8 z-50">
    <Button
      id="color-mode-toggle"
      @click="toggleColorMode"  
      variant="default"
      size="sm"
    >
      <span v-if="colorMode.value === 'dark'">🌞</span>
      <span v-else>🌙</span>
      </Button>
    </div>
      <NuxtPage />
    </main>
</div>
</template>

<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

import { Button } from '@/components/ui/button'

const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
