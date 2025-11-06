<template>
  <adminLayout>
    <h2 class="mb-4">Gestión de inspecciones</h2>

    <!-- Formulario de alta -->
    <form @submit.prevent="crearInspeccion" class="mb-4" style="max-width: 800px">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Solicitante</label>
          <input v-model="nueva.solicitante" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Institución ejecutora</label>
          <input v-model="nueva.institucion_ejecutora" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Inspector</label>
          <input v-model="nueva.inspector" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Tipo</label>
          <select v-model="nueva.tipo" class="form-select" required>
            <option value="">Seleccionar tipo</option>
            <option value="terreno">Terreno</option>
            <option value="negocio">Negocio</option>
          </select>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Terreno ID</label>
          <input v-model="nueva.terreno_id" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Negocio ID</label>
          <input v-model="nueva.negocio_id" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">¿Incluye conexión de agua?</label>
          <select v-model="nueva.incluye_conexion_agua" class="form-select">
            <option :value="true">Sí</option>
            <option :value="false">No</option>
          </select>
        </div>
        <div class="col-md-12 mb-3">
          <label class="form-label">Resultado</label>
          <textarea v-model="nueva.resultado" class="form-control" rows="3"></textarea>
        </div>
      </div>
      <button class="btn btn-success">Registrar inspección</button>
    </form>

    <!-- Tabla de inspecciones -->
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha solicitud</th>
          <th>Fecha realización</th>
          <th>Estado</th>
          <th>Inspector</th>
          <th>Tipo</th>
          <th>Terreno</th>
          <th>Negocio</th>
          <th>¿Agua?</th>
          <th>Resultado</th>
          <th>Archivo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="i in inspecciones" :key="i.id">
          <td>{{ i.id }}</td>
          <td>{{ i.fecha_solicitud }}</td>
          <td>{{ i.fecha_realizacion || '-' }}</td>
          <td>{{ i.estado }}</td>
          <td>{{ i.inspector }}</td>
          <td>{{ i.tipo }}</td>
          <td>{{ i.terreno_id || '-' }}</td>
          <td>{{ i.negocio_id || '-' }}</td>
          <td>{{ i.incluye_conexion_agua ? 'Sí' : 'No' }}</td>
          <td>{{ i.resultado || '-' }}</td>
          <td>
            <archivoEntidad entidad="inspeccion" :origen-id="i.id" />
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

const inspecciones = ref([]);
const nueva = ref({
  solicitante: '',
  institucion_ejecutora: '',
  inspector: '',
  tipo: '',
  terreno_id: null,
  negocio_id: null,
  incluye_conexion_agua: false,
  resultado: ''
});

// Cargar inspecciones
onMounted(async () => {
  const res = await fetch('/api/inspecciones', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  inspecciones.value = await res.json();
});

// Crear inspección
async function crearInspeccion() {
  const res = await fetch('/api/inspecciones', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(nueva.value)
  });

  const data = await res.json();
  if (res.ok) {
    inspecciones.value.unshift(data);
    nueva.value = {
      solicitante: '',
      institucion_ejecutora: '',
      inspector: '',
      tipo: '',
      terreno_id: null,
      negocio_id: null,
      incluye_conexion_agua: false,
      resultado: ''
    };
  } else {
    alert(data.error || 'Error al registrar inspección');
  }
}
</script>
