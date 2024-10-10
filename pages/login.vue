<template>
  <div class="min-h-screen w-full bg-white flex flex-col items-center justify-center">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">
      Sign In to Continue
    </h1>
    <button
      class="flex items-center bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition duration-300"
      @click="signInWithGoogle"
    >
      <Chrome class="w-6 h-6 mr-3" />
      Sign In With Google
    </button>
  </div>
</template>

<script setup>
import { Chrome } from 'lucide-vue-next'

const runtimeConfig = useRuntimeConfig()

const { auth } = useSupabaseClient()

const signInWithGoogle = async () => {
  console.log(runtimeConfig.public.siteUrl);
  
  try {
    await auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `https://lawyer-digital-ai-git-development-satriachandrayws-projects.vercel.app//redirect`,
      },
    })
  }
  catch (error) {
    console.error('Error initiating Google sign-in:', error)
  }
}
</script>
