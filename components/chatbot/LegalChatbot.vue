<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useChat } from '@ai-sdk/vue'

const { messages, input, handleSubmit, isLoading } = useChat({
  api: '/api/chat',
  onResponse: (response) => {
    console.log('Response:', response)
  },
})

const typingIndicator = ref('...')

onMounted(() => {
  // Add the welcome message to the messages array when the component mounts
  messages.value.push({
    id: 'welcome',
    role: 'assistant',
    content: "Opoo rek?"
  })
})

// Animate the typing indicator
const animateTyping = () => {
  let dots = 0
  return setInterval(() => {
    typingIndicator.value = '.'.repeat(dots % 4)
    dots++
  }, 300)
}

let typingAnimation

// Start and stop the typing animation based on isLoading
watch(isLoading, (loading) => {
  if (loading) {
    typingAnimation = animateTyping()
  } else {
    clearInterval(typingAnimation)
  }
})
</script>

<template>
  <div class="chatbot-container flex flex-col h-[600px] w-full max-w-md mx-auto border rounded-lg shadow-lg">
    <ScrollArea class="flex-grow p-4">
      <div v-for="message in messages" :key="message.id" class="mb-4">
        <div :class="[
          'p-3 rounded-lg',
          message.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted',
          'max-w-[80%]'
        ]">
          {{ message.content }}
        </div>
      </div>
      <div v-if="isLoading" class="typing-indicator mb-4">
        <div :class="[
          'p-3 rounded-lg',
          'bg-muted',
          'max-w-[80%]'
        ]">
          <strong>AI:</strong> Mengetik{{ typingIndicator }}
        </div>
      </div>
    </ScrollArea>
    <div class="p-4 border-t">
      <form @submit.prevent="handleSubmit" class="flex space-x-2">
        <Input
          v-model="input"
          placeholder="Ask a legal question..."
          class="flex-grow"
        />
        <Button type="submit" :disabled="input.length === 0">
          Send
        </Button>
      </form>
    </div>
  </div>
</template>