<template>
  <div>
    <h1>Edit Outline for: {{ topic }}</h1>
    <textarea v-model="content" class="textarea"></textarea>
    <button @click="exportEssay" class="btn">Export</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const topic = route.query.topic as string;
const outline = JSON.parse(route.query.outline as string);
const content = ref(outline.join('\n\n'));

const exportEssay = () => {
  // Logic to export content
};
</script>

<style scoped>
.textarea { @apply w-full h-64 p-2 border rounded; }
.btn { @apply p-2 bg-blue-500 text-white rounded; }
</style>
