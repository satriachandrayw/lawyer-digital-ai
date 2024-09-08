<template>
  <div class="flex items-center">
    <input
      type="radio"
      :id="id"
      :name="name"
      :value="value"
      v-model="modelValue"
      class="radio-input"
    />
    <label :for="id" class="ml-2">{{ label }}</label>
  </div>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core';

const props = defineProps<{
  id: string;
  name: string;
  value: string;
  modelValue?: string;
  label: string;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits);
</script>

<style scoped>
.radio-input {
  @apply form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out;
}
</style>