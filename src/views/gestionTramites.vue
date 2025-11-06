<template>
  <adminLayout>
    <h2 class="mb-4">Gestión de trámites</h2>

    <!-- Formulario de alta -->
    <form @submit.prevent="crearTramite" class="mb-4" style="max-width: 600px">
      <div class="mb-3">
        <label class="form-label">ID de vecino</label>
        <input v-model="nuevo.vecino_id" type="number" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Tipo de trámite</label>
        <select v-model="nuevo.tipo" class="form-select" required>
          <option value="">Seleccionar tipo</option>
          <option value="habilitacion">Habilitación</option>
          <option value="reclamo">Reclamo</option>
          <option value="solicitud">Solicitud</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Descripción</label>
        <textarea v-model="nuevo.descripcion" class="form-control" rows="4" required></textarea>
      </div>

      <button class="btn btn-success">Crear trámite</button>
    </form>

    <!-- Tabla de trámites -->
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>Vecino</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Resolución</th>
          <th>Archivo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in tramites" :key="t.id">
          <td>{{ t.id }}</td>
          <td>{{ t.vecino_id }}</td>
          <td>{{ t.tipo }}</td>
          <td>{{ t.estado }}</td>
          <td>{{ t.fecha_inicio }}</td>
          <td>{{ t.resolucion || '-' }}</td>
          <td>
            <archivoEntidad entidad="tramite" :origen-id="t.id" />
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

const tramites = ref([]);
const nuevo = ref({ vecino_id: '', tipo: '', descripcion: '' });

// Cargar trámites existentes
onMounted(async () => {
  const res = await fetch('/api/tramites', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  tramites.value = await res.json();
});

// Crear nuevo trámite
async function crearTramite() {
  const res = await fetch('/api/tramites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(nuevo.value)
  });

  const data = await res.json();
  if (res.ok) {
    tramites.value.unshift(data);
    nuevo.value = { vecino_id: '', tipo: '', descripcion: '' };
  } else {
    alert(data.error || 'Error al crear trámite');
  }
}

// Marcar trámite como resuelto
async function resolverTramite(id) {
  const resultado = prompt('Resultado del trámite:');
  if (!resultado) return;

  const res = await fetch(`/api/tramites/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ estado: 'resuelto', resultado })
  });

  if (res.ok) {
    const index = tramites.value.findIndex(t => t.id === id);
    tramites.value[index].estado = 'resuelto';
    tramites.value[index].resultado = resultado;
    tramites.value[index].fecha_resolucion = new Date().toISOString().split('T')[0];
  } else {
    alert('Error al actualizar trámite');
  }
}
</script>
