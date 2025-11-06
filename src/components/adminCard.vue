<template>
  <router-link :to="ruta" class="btn btn-outline-primary w-100 text-start">
    {{ nombre }}
  </router-link>
</template>

<script setup>
defineProps({
  nombre: String,
  ruta: String
});
</script>
