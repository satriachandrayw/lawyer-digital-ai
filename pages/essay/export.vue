<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
// import { saveAs } from 'file-saver';

const route = useRoute();
const topic = route.query.topic as string;
const outline = JSON.parse(route.query.outline as string);
const content = ref(outline.join('\n\n'));

const exportEssay = () => {
  const blob = new Blob([content.value], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${topic}.txt`);
};
</script>
