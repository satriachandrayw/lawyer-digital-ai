<script setup lang="ts">
import { ref } from 'vue'

const userInput = ref('')
const chatHistory = ref<{ role: 'user' | 'bot', content: string }[]>([])
const isLoading = ref(false)

const sendMessage = async () => {
  if (!userInput.value.trim()) return

  const userMessage = userInput.value
  chatHistory.value.push({ role: 'user', content: userMessage })
  userInput.value = ''
  isLoading.value = true

  try {
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: { message: userMessage }
    })

    chatHistory.value.push({ role: 'bot', content: response.message })
  } catch (error) {
    console.error('Error:', error)
    chatHistory.value.push({ role: 'bot', content: 'Sorry, I encountered an error. Please try again.' })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="chatbot-container flex flex-col h-[600px] w-full max-w-md mx-auto border rounded-lg shadow-lg">
    <ScrollArea class="flex-grow p-4">
      <div v-for="(message, index) in chatHistory" :key="index" class="mb-4">
        <div :class="[
          'p-3 rounded-lg',
          message.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted',
          'max-w-[80%]'
        ]">
          {{ message.content }}
        </div>
      </div>
    </ScrollArea>
    <div class="p-4 border-t">
      <form @submit.prevent="sendMessage" class="flex space-x-2">
        <Input
          v-model="userInput"
          placeholder="Ask a legal question..."
          class="flex-grow"
        />
        <Button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Sending...' : 'Send' }}
        </Button>
      </form>
    </div>
  </div>
</template>