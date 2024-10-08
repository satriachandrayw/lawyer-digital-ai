<template>
  <div class="editor-wrapper">
    <editor-content :editor="editor" />
    <bubble-menu :editor="editor" v-if="editor">
      <div class="bubble-menu">
        <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
          Bold
        </button>
        <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
          Italic
        </button>
        <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
          Strike
        </button>
        <button 
          v-for="level in [1, 2, 3]" 
          :key="level"
          @click="editor.chain().focus().toggleHeading({ level }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level }) }"
        >
          H{{ level }}
        </button>
        <button @click="editor.chain().focus().setParagraph().run()" :class="{ 'is-active': editor.isActive('paragraph') }">
          Paragraph
        </button>
      </div>
    </bubble-menu>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';

const props = defineProps({
  modelValue: {
    type: String,
    default: '<p>Start typing...</p>'
  }
});

const emit = defineEmits(['update:modelValue']);

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Heading.configure({
      levels: [1, 2, 3]
    }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML());
  },
});

watch(() => props.modelValue, (newContent) => {
  if (editor.value && newContent !== editor.value.getHTML()) {
    editor.value.commands.setContent(newContent, false);
  }
});

// Expose the Tiptap editor instance
defineExpose({ editor });
</script>

<style>
.editor-wrapper {
  position: relative;
}

.ProseMirror {
  min-height: 200px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
}

.ProseMirror:focus {
  outline: none;
}

.bubble-menu {
  display: flex;
  background-color: #0D0D0D;
  padding: 0.5rem;
  border-radius: 0.5rem;
  gap: 0.5rem;
}

.bubble-menu button {
  border: none;
  background: none;
  color: #FFF;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.bubble-menu button:hover,
.bubble-menu button.is-active {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.1);
}

</style>