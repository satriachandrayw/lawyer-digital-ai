<template>
  <div class="min-h-screen w-full bg-white flex flex-col items-center justify-center">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">Sign In to Continue</h1>
    <button 
      @click="signInWithGoogle" 
      class="flex items-center bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition duration-300"
    >
      <Chrome class="w-6 h-6 mr-3" />
      Sign In With Google
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { Chrome } from 'lucide-vue-next';

const runtimeConfig = useRuntimeConfig()

const {auth} = useSupabaseClient()
const user = useSupabaseUser()

const signInWithGoogle = async () => {
  try {
    const { data } = await auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${runtimeConfig.siteUrl}/redirect`
      }
    })
  } catch (error) {
    console.error('Error initiating Google sign-in:', error);
  }
};
</script>
