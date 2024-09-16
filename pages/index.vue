<template>
  <div class="min-h-screen w-full bg-gradient-to-r from-blue-300 to-purple-500 text-white flex flex-col">
    <header class="container mx-auto py-4 px-4 flex justify-end">
      <img src="@/assets/ahli-hukum.png" alt="Logo" class="logo" />
    </header>

    <main class="flex-grow flex flex-col justify-center items-center text-center px-4">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          <v-typical
          :steps="['Craft Compelling Essays', 1000, 'Generate Insightful Articles', 1000, 'Elevate Your Writing', 1000]"
          :loop="Infinity"
            :wrapper="'h1'"
            class="typing-text"
          ></v-typical>
      </h1>
      <p class="text-xl md:text-2xl mb-8">Your ultimate writing assistant</p>
      <button 
      @click="goToEssay" 
      class="bg-white text-purple-700 hover:bg-purple-100 text-lg px-8 py-4 rounded-full transition duration-300">
        Start Writing Now
      </button>
    </main>

    <footer class="container mx-auto py-4 text-center">
      <p>&copy; {{ currentYear }} AhliHukum. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VTypical from 'vue-typical'
import { useRouter } from 'vue-router';

const router = useRouter();

const currentYear = ref(new Date().getFullYear())

const goToEssay = () => {
  router.push('/essay');
};
</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
}

.min-h-screen {
  min-height: 100vh; /* Ensure it spans the full viewport height */
}

.w-full {
  width: 100%; /* Ensure it spans the full viewport width */
}

.logo {
  width: 160px; /* Default size for mobile */
}

@media (min-width: 640px) { /* Tablet */
  .logo {
    width: 180px; /* Size for tablets */
  }
}

@media (min-width: 768px) { /* Desktop */
  .logo {
    width: 200px; /* Size for desktops */
  }
}
</style>