<!-- src/app.vue -->
<template>
  <Header />

  <main class="min-vh-100">
    <router-view />
  </main>

  <Footer />
</template>

<script setup>
import Header from '@/components/header.vue';
import Footer from '@/components/footer.vue';
</script>

<style>
/* Estilos globales si querés agregar algo */
</style>

