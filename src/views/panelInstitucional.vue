<template>
  <adminLayout>
    <h2 class="mb-4">Panel institucional</h2>
    <p>Bienvenido al sistema de gestión municipal.</p>

    <!-- Datos del usuario logueado -->
    <div class="card p-3 mb-4">
      <h5>{{ usuario?.nombre }}</h5>
      <p><strong>Email:</strong> {{ usuario?.email }}</p>
      <p><strong>Rol:</strong> {{ usuario?.rol }}</p>
      <p v-if="usuario?.ultimo_login"><strong>Último acceso:</strong> {{ usuario.ultimo_login }}</p>
    </div>

    <!-- Módulos disponibles según rol -->
    <div class="row mt-4 g-3">
      <div
        class="col-md-4"
        v-for="modulo in modulosFiltrados"
        :key="modulo.ruta"
      >
        <adminCard :nombre="modulo.nombre" :ruta="modulo.ruta" />
      </div>
    </div>
  </adminLayout>
</template>

<script setup>
// Panel institucional con datos del usuario y módulos filtrados por rol

import { ref, computed, onMounted } from 'vue';
import adminLayout from '@/layouts/adminLayout.vue';
import adminCard from '@/components/adminCard.vue';

const usuario = ref(null);

// Módulos institucionales disponibles
const modulos = [
  { nombre: 'Gestión de trámites', ruta: '/panel/tramites', roles: ['admin', 'empleado'] },
  { nombre: 'Sugerencias recibidas', ruta: '/panel/sugerencias', roles: ['admin', 'empleado'] },
  { nombre: 'Gestión de vecinos', ruta: '/panel/vecinos', roles: ['empleado'] },
  { nombre: 'Gestión de empleados', ruta: '/panel/empleados', roles: ['admin'] },
  { nombre: 'Gestión de artículos', ruta: '/panel/articulos', roles: ['admin'] },
  { nombre: 'Inspecciones', ruta: '/panel/inspecciones', roles: ['empleado'] },
  { nombre: 'Terrenos y conexiones', ruta: '/panel/terrenos', roles: ['empleado'] }
];

// Filtra módulos según rol del usuario
const modulosFiltrados = computed(() => {
  if (!usuario.value) return [];
  return modulos.filter(m => m.roles.includes(usuario.value.rol));
});

// Carga datos del usuario desde localStorage
onMounted(() => {
  const raw = localStorage.getItem('usuario');
  usuario.value = raw ? JSON.parse(raw) : null;
});
</script>
