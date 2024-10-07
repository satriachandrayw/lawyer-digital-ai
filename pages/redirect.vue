<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-gray-100">
    <p class="text-2xl text-gray-600">
      Redirecting...
    </p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { watch } from 'vue'

const router = useRouter()
const user = useSupabaseUser()

watch(user, () => {
  if (user.value) {
    router.push('/essay')
  }
  else {
    router.push('/')
  }
}, { immediate: true })
</script>
