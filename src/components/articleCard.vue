<!-- src/components/ArticleCard.vue -->
<template>
  <div class="card mb-3">
    <img :src="article.imagen" class="card-img-top" alt="Imagen del artículo" />
    <div class="card-body">
      <h5 class="card-title">{{ article.titulo }}</h5>
      <p class="card-text">{{ article.descripcion }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  article: Object
});
</script>