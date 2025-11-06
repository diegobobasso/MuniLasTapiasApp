<template>
  <baseLayout>
    <div class="text-center">
      <h2 class="mb-3">Pago de servicio</h2>

      <!-- Mensaje de carga -->
      <div v-if="cargando">Cargando información del servicio...</div>

      <!-- Detalle del servicio -->
      <div v-else-if="servicio">
        <p><strong>Servicio:</strong> {{ servicio.tipo }}</p>
        <p><strong>Estado:</strong> {{ servicio.estado }}</p>
        <p><strong>Último pago:</strong> {{ servicio.ultimo_pago }}</p>
        <p><strong>Deuda:</strong> {{ servicio.deuda }} ARS</p>

        <!-- Botón de pago simulado -->
        <button class="btn btn-success mt-3" @click="iniciarPago">
          Iniciar pago
        </button>
      </div>

      <!-- Servicio no encontrado -->
      <div v-else class="text-danger">No se encontró el servicio.</div>
    </div>
  </baseLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import baseLayout from '@/layouts/baseLayout.vue';

const route = useRoute();
const servicio = ref(null);
const cargando = ref(true);

// Carga los datos del servicio por ID
onMounted(async () => {
  try {
    const res = await fetch(`/api/consultas/servicios/${route.params.id}`);
    const data = await res.json();
    if (res.ok) servicio.value = data;
  } catch (err) {
    console.error('Error al cargar servicio:', err);
  } finally {
    cargando.value = false;
  }
});

// Simulación de pago
const iniciarPago = () => {
  alert('Aquí se integrará el proveedor de pagos (MercadoPago, Red Link, etc.)');
};
</script>
