<template>
  <div :class="{ 'dark': colorMode.value === 'dark' }">
    <div class="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main class="container mx-auto p-4">
      <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

const colorMode = useColorMode()
</script>