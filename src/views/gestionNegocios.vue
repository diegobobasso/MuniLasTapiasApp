<template>
  <adminLayout>
    <h2 class="mb-4">Gestión de negocios</h2>

    <!-- Formulario de alta o edición -->
    <form @submit.prevent="guardarNegocio" class="mb-4" style="max-width: 800px">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Nombre del negocio</label>
          <input v-model="form.nombre" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Rubro</label>
          <input v-model="form.rubro" class="form-control" required />
        </div>
        <div class="col-md-12 mb-3">
          <label class="form-label">Dirección</label>
          <input v-model="form.direccion" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Titular (vecino_id)</label>
          <input v-model="form.titular_id" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Terreno ID</label>
          <input v-model="form.terreno_id" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">¿Inspeccionado?</label>
          <select v-model="form.inspeccionado" class="form-select">
            <option :value="true">Sí</option>
            <option :value="false">No</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary">{{ modoEdicion ? 'Actualizar' : 'Agregar' }}</button>
      <button v-if="modoEdicion" @click="cancelarEdicion" class="btn btn-secondary ms-2">Cancelar</button>
    </form>

    <!-- Tabla de negocios -->
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th
          ><th>Rubro</th>
          <th>Dirección</th>
          <th>Titular</th>
          <th>Terreno</th>
          <th>Archivo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in negocios" :key="n.id">
          <td>{{ n.id }}</td>
          <td>{{ n.nombre }}</td>
          <td>{{ n.rubro }}</td>
          <td>{{ n.direccion }}</td>
          <td>{{ n.titular_id }}</td>
          <td>{{ n.terreno_id }}</td>
          <td>
            <archivoEntidad entidad="negocio" :origen-id="n.id" />
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

const negocios = ref([]);
const form = ref({});
const modoEdicion = ref(false);
const negocioId = ref(null);

// Cargar negocios al iniciar
onMounted(async () => {
  const res = await fetch('/api/negocios', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  negocios.value = await res.json();
});

// Guardar negocio (crear o actualizar)
async function guardarNegocio() {
  const url = modoEdicion.value
    ? `/api/negocios/${negocioId.value}`
    : '/api/negocios';

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
      const index = negocios.value.findIndex(n => n.id === negocioId.value);
      negocios.value[index] = data;
    } else {
      negocios.value.push(data);
    }
    cancelarEdicion();
  } else {
    alert(data.error || 'Error al guardar negocio');
  }
}

// Activar edición
function editarNegocio(n) {
  form.value = { ...n };
  negocioId.value = n.id;
  modoEdicion.value = true;
}

// Cancelar edición
function cancelarEdicion() {
  form.value = {
    nombre: '', rubro: '', direccion: '',
    titular_id: null, terreno_id: null, inspeccionado: false
  };
  negocioId.value = null;
  modoEdicion.value = false;
}

// Eliminar negocio
async function eliminarNegocio(id) {
  if (!confirm('¿Eliminar este negocio?')) return;

  const res = await fetch(`/api/negocios/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  if (res.ok) {
    negocios.value = negocios.value.filter(n => n.id !== id);
  } else {
    alert('Error al eliminar negocio');
  }
}
</script>
