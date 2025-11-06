<template>
  <adminLayout>
    <h2 class="mb-4">Sugerencias recibidas</h2>

    <!-- Tabla institucional -->
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>Vecino</th>
          <th>Fecha</th>
          <th>Tipo</th>
          <th>Texto</th>
          <th>Estado</th>
          <th>Respuesta</th>
          <th>Archivo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in sugerencias" :key="s.id">
          <td>{{ s.id }}</td>
          <td>{{ s.vecino_id }}</td>
          <td>{{ s.fecha }}</td>
          <td>{{ s.tipo }}</td>
          <td>{{ s.texto }}</td>
          <td>{{ s.estado }}</td>
          <td>{{ s.respuesta || '-' }}</td>
          <td>
            <archivoEntidad entidad="sugerencia" :origen-id="s.id" />
          </td>
        </tr>
      </tbody>
    </table>
  </adminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import archivoEntidad from '@/components/archivoEntidad.vue'
import adminLayout from '@/layouts/adminLayout.vue';

const sugerencias = ref([]);

// Cargar sugerencias
onMounted(async () => {
  const res = await fetch('/api/sugerencias', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  sugerencias.value = await res.json();
});

// Responder sugerencia
async function responderSugerencia(id) {
  const respuesta = prompt('Respuesta institucional:');
  if (!respuesta) return;

  const res = await fetch(`/api/sugerencias/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ estado: 'respondida', respuesta })
  });

  if (res.ok) {
    const index = sugerencias.value.findIndex(s => s.id === id);
    sugerencias.value[index].estado = 'respondida';
    sugerencias.value[index].respuesta = respuesta;
    sugerencias.value[index].fecha_respuesta = new Date().toISOString().split('T')[0];
  } else {
    alert('Error al actualizar sugerencia');
  }
}
</script>
