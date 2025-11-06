<template>
  <div class="container py-4">
    <h2 class="text-center mb-4">Ordenanzas Municipales</h2>
    <ul class="list-group">
      <li class="list-group-item" v-for="ordenanza in ordenanzas" :key="ordenanza.id">
        <strong>{{ ordenanza.titulo }}</strong><br />
        <small>{{ ordenanza.descripcion }}</small>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const ordenanzas = ref([]);

onMounted(async () => {
  const res = await fetch('/api/ordenanzas');
  ordenanzas.value = await res.json();
});
</script>
