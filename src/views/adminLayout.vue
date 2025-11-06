<template>
  <div class="admin-layout d-flex">
    <!-- Menú lateral -->
    <aside class="bg-light border-end p-3" style="width: 220px; min-height: 100vh">
      <h5 class="mb-4">Municipalidad</h5>
      <nav class="nav flex-column">
        <router-link v-for="item in menu" :key="item.ruta" :to="item.ruta" class="nav-link">
          {{ item.nombre }}
        </router-link>
      </nav>
      <button class="btn btn-sm btn-outline-danger mt-4" @click="logout">Cerrar sesión</button>
    </aside>

    <!-- Contenido principal -->
    <main class="flex-grow-1 p-4">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// Menú institucional
const menu = [
  { nombre: 'Panel', ruta: '/panel' },
  { nombre: 'Trámites', ruta: '/panel/tramites' },
  { nombre: 'Sugerencias', ruta: '/panel/sugerencias' },
  { nombre: 'Vecinos', ruta: '/panel/vecinos' },
  { nombre: 'Inspecciones', ruta: '/panel/inspecciones' },
  { nombre: 'Terrenos', ruta: '/panel/terrenos' },
  { nombre: 'Artículos', ruta: '/panel/articulos' }
];

// Cierre de sesión
const logout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};
</script>
