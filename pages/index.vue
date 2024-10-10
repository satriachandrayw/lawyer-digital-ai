<template>
  <div class="min-h-screen w-full bg-gradient-to-r from-blue-300 to-purple-500 text-white flex flex-col">
    <header class="container mx-auto py-4 px-4 flex justify-between items-center absolute top-0 left-0 right-0 z-10">
      <img
        src="@/assets/ahli-hukum.png"
        alt="Logo"
        class="logo"
      >
      <nav class="hidden md:flex space-x-6">
        <a href="#" class="hover:text-purple-200 transition duration-300">Home</a>
        <a href="#" class="hover:text-purple-200 transition duration-300">Product</a>
        <a href="#" class="hover:text-purple-200 transition duration-300">Pricing</a>
        <a href="#" class="hover:text-purple-200 transition duration-300">Hiring</a>
      </nav>
      <Button class="md:hidden" variant="ghost" size="icon">
        <Menu class="h-6 w-6" />
      </Button>
    </header>

    <main class="flex-grow flex flex-col">
      <!-- Hero Section -->
      <section class="flex-grow flex flex-col justify-center items-center text-center px-4 min-h-screen">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          <v-typical
            :steps="['Craft Compelling Essays', 1000, 'Generate Insightful Articles', 1000, 'Elevate Your Writing', 1000]"
            :loop="Infinity"
            :wrapper="'h1'"
            class="blink"
          />
        </h1>
        <p class="text-xl md:text-2xl mb-8">
          Your ultimate writing assistant
        </p>
        <Button
          size="lg"
          class="bg-white text-purple-700 hover:bg-purple-100"
          @click="handleStartWriting"
        >
          Start Writing Now
        </Button>
      </section>

      <!-- How It Works Section -->
      <section class="bg-white text-purple-700 py-16">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Step 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Enter your topic or legal question</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Step 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Our AI analyzes and generates content</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Step 3</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Review and refine the generated content</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <!-- Call to Action Section -->
      <section class="bg-purple-600 text-white py-16">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold mb-4">Ready to Transform Your Legal Writing?</h2>
          <p class="text-xl mb-8">Join our waitlist and be the first to experience the future of legal assistance</p>
          <Button variant="secondary" size="lg">Join the Waitlist</Button>
        </div>
      </section>
    </main>

    <footer class="bg-purple-800 text-white py-8">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {{ currentYear }} AhliHukum. All rights reserved.</p>
          <div class="flex space-x-4 mt-4 md:mt-0">
            <a href="#" class="hover:text-purple-300 transition duration-300">Privacy Policy</a>
            <a href="#" class="hover:text-purple-300 transition duration-300">Terms of Service</a>
            <a href="#" class="hover:text-purple-300 transition duration-300">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VTypical from 'vue-typical'
import { useRouter } from 'vue-router'
import { Menu } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const router = useRouter()
const currentYear = ref(new Date().getFullYear())

const user = useSupabaseUser()

const handleStartWriting = async () => {
  if (user.value) {
    router.push('/essay')
  }
  else {
    router.push('/login')
  }
}
</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
}

.min-h-screen {
  min-height: 100vh;
}

.w-full {
  width: 100%;
}

.logo {
  width: 160px;
}

@media (min-width: 640px) {
  .logo {
    width: 180px;
  }
}

@media (min-width: 768px) {
  .logo {
    width: 200px;
  }
}

.blink::after {
  content: '|';
  animation: blink 1s infinite step-start;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>