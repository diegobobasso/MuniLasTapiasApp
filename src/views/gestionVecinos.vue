<template>
  <adminLayout>
    <h2 class="mb-4">Gestión de vecinos</h2>

    <!-- Formulario de alta -->
    <form @submit.prevent="crearVecino" class="mb-4" style="max-width: 700px">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Nombre</label>
          <input v-model="nuevo.nombre" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Apellido</label>
          <input v-model="nuevo.apellido" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">DNI</label>
          <input v-model="nuevo.dni" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">CUIL / CUIT</label>
          <input v-model="nuevo.cuil_cuit" class="form-control" />
        </div>
        <div class="col-md-12 mb-3">
          <label class="form-label">Domicilio</label>
          <input v-model="nuevo.domicilio" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Teléfono</label>
          <input v-model="nuevo.telefono" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Email</label>
          <input v-model="nuevo.email" class="form-control" />
        </div>
      </div>
      <button class="btn btn-success">Agregar vecino</button>
    </form>

    <!-- Tabla de vecinos -->
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>DNI</th>
          <th>CUIL/CUIT</th>
          <th>Domicilio</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>Archivo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="v in vecinos" :key="v.id">
          <td>{{ v.id }}</td>
          <td>{{ v.nombre }}</td>
          <td>{{ v.apellido }}</td>
          <td>{{ v.dni }}</td>
          <td>{{ v.cuil_cuit }}</td>
          <td>{{ v.domicilio }}</td>
          <td>{{ v.telefono }}</td>
          <td>{{ v.email }}</td>
          <td>
            <archivoEntidad entidad="vecino" :origen-id="v.id" />
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

const vecinos = ref([]);
const nuevo = ref({
  nombre: '', apellido: '', dni: '', cuil_cuit: '',
  domicilio: '', telefono: '', email: ''
});

// Cargar vecinos al iniciar
onMounted(async () => {
  const res = await fetch('/api/vecinos', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  vecinos.value = await res.json();
});

// Crear nuevo vecino
async function crearVecino() {
  const res = await fetch('/api/vecinos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(nuevo.value)
  });

  const data = await res.json();
  if (res.ok) {
    vecinos.value.push(data);
    nuevo.value = {
      nombre: '', apellido: '', dni: '', cuil_cuit: '',
      domicilio: '', telefono: '', email: ''
    };
  } else {
    alert(data.error || 'Error al crear vecino');
  }
}
</script>
