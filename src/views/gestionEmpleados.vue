<template>
  <baseLayout>
    <h2 class="mb-4">Gestión de empleados</h2>

    <!-- Formulario de alta -->
    <form @submit.prevent="crearEmpleado" class="mb-4">
      <div class="row g-3">
        <div class="col-md-6">
          <input v-model="nuevo.nombre" type="text" class="form-control" placeholder="Nombre completo" required />
        </div>
        <div class="col-md-6">
          <input v-model="nuevo.email" type="email" class="form-control" placeholder="Email institucional" required />
        </div>
        <div class="col-md-6">
          <select v-model="nuevo.rol" class="form-select" required>
            <option disabled value="">Rol</option>
            <option value="admin">Administrador</option>
            <option value="empleado">Empleado</option>
          </select>
        </div>
        <div class="col-md-6">
          <input v-model="nuevo.password" type="password" class="form-control" placeholder="Contraseña inicial" required />
        </div>
      </div>
      <button type="submit" class="btn btn-primary mt-3">Crear empleado</button>
    </form>

    <!-- Tabla de empleados -->
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Alta</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in empleados" :key="e.id">
          <td>{{ e.nombre }}</td>
          <td>{{ e.email }}</td>
          <td>{{ e.rol }}</td>
          <td>{{ formatFecha(e.fecha_alta) }}</td>
          <td>
            <button @click="restaurarClave(e.id)" class="btn btn-sm btn-warning">Restaurar clave</button>
          </td>
        </tr>
      </tbody>
    </table>
  </baseLayout>
</template>

<script setup>
// Gestión de empleados institucional (solo admin)
// Permite alta y restauración de contraseña

import { ref, onMounted } from 'vue';
import baseLayout from '@/layouts/baseLayout.vue';

const empleados = ref([]);
const nuevo = ref({ nombre: '', email: '', rol: '', password: '' });

const token = localStorage.getItem('token');

/**
 * Cargar empleados activos
 */
const cargarEmpleados = async () => {
  const res = await fetch('/api/empleados', {
    headers: { Authorization: `Bearer ${token}` }
  });
  empleados.value = await res.json();
};

/**
 * Crear nuevo empleado
 */
const crearEmpleado = async () => {
  const res = await fetch('/api/empleados', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(nuevo.value)
  });
  if (res.ok) {
    await cargarEmpleados();
    nuevo.value = { nombre: '', email: '', rol: '', password: '' };
  }
};

/**
 * Restaurar contraseña
 */
const restaurarClave = async (id) => {
  const nuevaClave = prompt('Nueva contraseña para el empleado:');
  if (!nuevaClave) return;

  await fetch(`/api/empleados/restaurar-clave/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ nuevaClave })
  });
  alert('Contraseña restaurada');
};

onMounted(cargarEmpleados);

const formatFecha = (fecha) => new Date(fecha).toLocaleDateString();
</script>
