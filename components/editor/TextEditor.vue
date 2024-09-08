<template>
  <div class="quill-editor">
    <div ref="editor"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useNuxtApp } from '#app';

const props = defineProps({
  modelValue: {
    type: String,
    default: '<p>Start typing...</p>'
  }
});

const emit = defineEmits(['update:modelValue']);

const editor = ref(null);
let quill = null;

onMounted(() => {
  const { $quill } = useNuxtApp();
  
  quill = new $quill(editor.value, {
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean']
      ]
    }
  });

  quill.root.innerHTML = props.modelValue;

  quill.on('text-change', () => {
    emit('update:modelValue', quill.root.innerHTML);
  });
});

watch(() => props.modelValue, (newContent) => {
  if (quill && newContent !== quill.root.innerHTML) {
    quill.root.innerHTML = newContent;
  }
});
</script>

<style>
.quill-editor {
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
