<!-- src/views/Home.vue -->
<template>
  <Banner />
  <div class="container my-4">
    <h2 class="text-center">Últimas novedades</h2>
    <div class="row">
      <div class="col-md-4" v-for="articulo in articulos" :key="articulo.id">
        <ArticleCard :article="articulo" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ArticleCard from '@/components/ArticleCard.vue';
import Banner from '@/components/Banner.vue';

const articulos = ref([]);

onMounted(async () => {
  const res = await fetch('/api/articulos');
  articulos.value = await res.json();
});
</script>