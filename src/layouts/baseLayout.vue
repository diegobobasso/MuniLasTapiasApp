<!-- src/layouts/baseLayout.vue -->
<template>
  <div class="base-layout">
    <!-- Encabezado institucional -->
    <header class="bg-light py-3 border-bottom text-center">
      <img src="/multimedia/img/LOGO MUNI LAS TAPIAS.jpg" alt="Logo Municipalidad" height="60" class="mb-2" />
      <h1 class="h4 m-0">Municipalidad de Las Tapias</h1>
    </header>

    <!-- Contenido dinámico -->
    <main class="container py-5">
      <slot />
    </main>

    <!-- Pie institucional -->
    <footer class="text-muted text-center py-3 small">
      &copy; {{ new Date().getFullYear() }} Municipalidad de Las Tapias
    </footer>
  </div>
</template>

<script setup>
// No se necesita lógica adicional
</script>

<style scoped>
.base-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
main {
  flex: 1;
}
</style>
