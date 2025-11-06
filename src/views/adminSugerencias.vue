<template>
  <div class="container mt-5">
    <h2>Sugerencias recibidas</h2>

    <table class="table table-bordered mt-4" v-if="sugerencias.length">
      <thead class="table-light">
        <tr>
          <th>Fecha</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Mensaje</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in sugerencias" :key="s.id">
          <td>{{ formatFecha(s.fecha) }}</td>
          <td>{{ s.nombre }}</td>
          <td>{{ s.email }}</td>
          <td>{{ s.mensaje }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else class="text-muted">No hay sugerencias registradas.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const sugerencias = ref([]);

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-AR');
};

onMounted(async () => {
  try {
    const res = await fetch('/api/sugerencias');
    sugerencias.value = await res.json();
  } catch (err) {
    console.error('Error al cargar sugerencias:', err);
  }
});
</script>
