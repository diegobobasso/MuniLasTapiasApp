<template>
  <adminLayout>
    <h2 class="mb-4">Panel institucional</h2>
    <p>Bienvenido al sistema de gestión municipal.</p>

    <div class="row mt-4 g-3">
      <div class="col-md-4" v-for="modulo in modulos" :key="modulo.ruta">
        <adminCard :nombre="modulo.nombre" :ruta="modulo.ruta" />
      </div>
    </div>
  </adminLayout>
</template>

<script setup>
import adminLayout from '@/layouts/adminLayout.vue';
import adminCard from '@/components/adminCard.vue';

const modulos = [
  { nombre: 'Gestión de trámites', ruta: '/panel/tramites' },
  { nombre: 'Sugerencias recibidas', ruta: '/panel/sugerencias' },
  { nombre: 'Gestión de vecinos', ruta: '/panel/vecinos' },
  { nombre: 'Inspecciones', ruta: '/panel/inspecciones' },
  { nombre: 'Terrenos y conexiones', ruta: '/panel/terrenos' }
];
</script>
