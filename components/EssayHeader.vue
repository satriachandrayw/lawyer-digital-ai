<template>
  <header class="flex justify-end items-center p-4 bg-gray-100 dark:bg-gray-800 z-10">
    <h1 class="text-lg font-semibold">
      Hi, {{ userName }}
    </h1>
    <button
      class="ml-4 text-gray-600 hover:text-red-500 transition-colors duration-200"
      @click="logout"
    >
      Log out
    </button>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const userName = ref('')

onMounted(async () => {
  if (user.value) {
    userName.value = user.value.user_metadata.full_name || user.value.email || 'User'
  }
})

const logout = async () => {
  try {
    await supabase.auth.signOut()
    router.push('/')
  }
  catch (error) {
    console.error('Error during logout:', error)
  }
}
</script>
