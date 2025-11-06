<template>
  <adminLayout>
    <h2 class="mb-4">Gestión de conexiones de agua</h2>

    <!-- Formulario de alta o edición -->
    <form @submit.prevent="guardarConexion" class="mb-4" style="max-width: 700px">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Terreno ID</label>
          <input v-model="form.terreno_id" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Estado</label>
          <select v-model="form.estado" class="form-select" required>
            <option value="activa">Activa</option>
            <option value="inactiva">Inactiva</option>
            <option value="suspendida">Suspendida</option>
          </select>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Medidor</label>
          <input v-model="form.medidor" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Fecha de alta</label>
          <input v-model="form.fecha_alta" type="date" class="form-control" />
        </div>
        <div class="col-md-12 mb-3">
          <label class="form-label">Uso especial</label>
          <input v-model="form.uso_especial" class="form-control" />
        </div>
      </div>
      <button class="btn btn-primary">{{ modoEdicion ? 'Actualizar' : 'Agregar' }}</button>
      <button v-if="modoEdicion" @click="cancelarEdicion" class="btn btn-secondary ms-2">Cancelar</button>
    </form>

    <!-- Tabla de conexiones -->
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>ID</th><th>Terreno</th><th>Estado</th><th>Medidor</th><th>Fecha alta</th><th>Uso</th><th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in conexiones" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ c.terreno_id }}</td>
          <td>{{ c.estado }}</td>
          <td>{{ c.medidor }}</td>
          <td>{{ c.fecha_alta }}</td>
          <td>{{ c.uso_especial }}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" @click="editarConexion(c)">Editar</button>
            <button class="btn btn-sm btn-outline-danger ms-2" @click="eliminarConexion(c.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </adminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import adminLayout from '@/layouts/adminLayout.vue';

const conexiones = ref([]);
const form = ref({});
const modoEdicion = ref(false);
const conexionId = ref(null);

// Cargar conexiones
onMounted(async () => {
  const res = await fetch('/api/conexiones', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  conexiones.value = await res.json();
});

// Guardar conexión (crear o actualizar)
async function guardarConexion() {
  const url = modoEdicion.value
    ? `/api/conexiones/${conexionId.value}`
    : '/api/conexiones';

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
      const index = conexiones.value.findIndex(c => c.id === conexionId.value);
      conexiones.value[index] = data;
    } else {
      conexiones.value.push(data);
    }
    cancelarEdicion();
  } else {
    alert(data.error || 'Error al guardar conexión');
  }
}

// Activar edición
function editarConexion(c) {
  form.value = { ...c };
  conexionId.value = c.id;
  modoEdicion.value = true;
}

// Cancelar edición
function cancelarEdicion() {
  form.value = {
    terreno_id: null,
    estado: '',
    medidor: '',
    fecha_alta: '',
    uso_especial: ''
  };
  conexionId.value = null;
  modoEdicion.value = false;
}

// Eliminar conexión
async function eliminarConexion(id) {
  if (!confirm('¿Eliminar esta conexión?')) return;

  const res = await fetch(`/api/conexiones/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  if (res.ok) {
    conexiones.value = conexiones.value.filter(c => c.id !== id);
  } else {
    alert('Error al eliminar conexión');
  }
}
</script>
