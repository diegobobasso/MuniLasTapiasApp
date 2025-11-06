<template>
  <adminLayout>
    <h2 class="mb-4">Gestión de terrenos</h2>

    <!-- Formulario de alta o edición -->
    <form @submit.prevent="guardarTerreno" class="mb-4" style="max-width: 900px">
      <div class="row">
        <div class="col-md-4 mb-3">
          <label class="form-label">Partida</label>
          <input v-model="form.partida" class="form-control" required />
        </div>
        <div class="col-md-4 mb-3">
          <label class="form-label">Cuenta</label>
          <input v-model="form.cuenta" class="form-control" />
        </div>
        <div class="col-md-4 mb-3">
          <label class="form-label">Dirección</label>
          <input v-model="form.direccion" class="form-control" required />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Superficie total</label>
          <input v-model="form.superficie_total" type="number" class="form-control" />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Superficie construida</label>
          <input v-model="form.superficie_construida" type="number" class="form-control" />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Cubiertos</label>
          <input v-model="form.metros_cubiertos" type="number" class="form-control" />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Semicubiertos</label>
          <input v-model="form.metros_semicubiertos" type="number" class="form-control" />
        </div>
        <div class="col-md-4 mb-3">
          <label class="form-label">Tipo</label>
          <select v-model="form.tipo" class="form-select">
            <option value="urbano">Urbano</option>
            <option value="rural">Rural</option>
          </select>
        </div>
        <div class="col-md-4 mb-3">
          <label class="form-label">Estado</label>
          <select v-model="form.estado" class="form-select">
            <option value="construido">Construido</option>
            <option value="baldio">Baldío</option>
          </select>
        </div>
        <div class="col-md-4 mb-3">
          <label class="form-label">¿Inspeccionado?</label>
          <select v-model="form.inspeccionado" class="form-select">
            <option :value="true">Sí</option>
            <option :value="false">No</option>
          </select>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Propietario ID</label>
          <input v-model="form.propietario_id" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Representante ID</label>
          <input v-model="form.representante_id" class="form-control" />
        </div>
      </div>
      <button class="btn btn-primary">{{ modoEdicion ? 'Actualizar' : 'Agregar' }}</button>
      <button v-if="modoEdicion" @click="cancelarEdicion" class="btn btn-secondary ms-2">Cancelar</button>
    </form>

    <!-- Tabla -->
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>Partida</th>
          <th>Cuenta</th>
          <th>Dirección</th>
          <th>Estado</th>
          <th>Propietario</th>
          <th>Archivo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in terrenos" :key="t.id">
          <td>{{ t.id }}</td>
          <td>{{ t.partida }}</td>
          <td>{{ t.cuenta }}</td>
          <td>{{ t.direccion }}</td>
          <td>{{ t.estado }}</td>
          <td>{{ t.propietario_id }}</td>
          <td>
            <archivoEntidad entidad="terreno" :origen-id="t.id" />
          </td>
        </tr>
      </tbody>
    </table>
  </adminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import adminLayout from '@/layouts/adminLayout.vue';
import archivoEntidad from '@/components/archivoEntidad.vue'

const terrenos = ref([]);
const form = ref({});
const modoEdicion = ref(false);
const terrenoId = ref(null);

// Cargar terrenos
onMounted(async () => {
  const res = await fetch('/api/terrenos', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  terrenos.value = await res.json();
});

// Guardar terreno (crear o actualizar)
async function guardarTerreno() {
  const url = modoEdicion.value
    ? `/api/terrenos/${terrenoId.value}`
    : '/api/terrenos';

  const method = modoEdicion.value ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(form.value)
  });

  const data = await res.json();
  if (res.ok) {
    if (modoEdicion.value) {
      const index = terrenos.value.findIndex(t => t.id === terrenoId.value);
      terrenos.value[index] = data;
    } else {
      terrenos.value.push(data);
    }
    cancelarEdicion();
  } else {
    alert(data.error || 'Error al guardar terreno');
  }
}

// Activar edición
function editarTerreno(t) {
  form.value = { ...t };
  terrenoId.value = t.id;
  modoEdicion.value = true;
}

// Cancelar edición
function cancelarEdicion() {
  form.value = {
    partida: '', cuenta: '', direccion: '',
    superficie_total: null, superficie_construida: null,
    metros_cubiertos: null, metros_semicubiertos: null,
    tipo: '', estado: '', inspeccionado: false,
    propietario_id: null, representante_id: null
  };
  terrenoId.value = null;
  modoEdicion.value = false;
}
</script>
