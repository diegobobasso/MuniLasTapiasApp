<template>
  <div class="container py-4">
    <h2 class="text-center mb-4">Noticias</h2>
    <div class="row">
      <ArticleCard v-for="articulo in articulos" :key="articulo.id" :articulo="articulo" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ArticleCard from '../components/ArticleCard.vue';

const articulos = ref([]);

onMounted(async () => {
  const res = await fetch('/api/articulos');
  articulos.value = await res.json();
});
</script>
