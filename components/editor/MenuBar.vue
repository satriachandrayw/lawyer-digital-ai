<template>
  <div class="menu-bar">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  editor: {
    type: Object,
    required: true,
  },
})
</script>
