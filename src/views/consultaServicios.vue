<template>
  <baseLayout>
    <h2 class="text-center mb-4">Consulta de servicios</h2>

    <!-- Formulario para ingresar CIUL o CUIT -->
    <form @submit.prevent="consultarServicios" class="mx-auto" style="max-width: 500px">
      <div class="mb-3">
        <label for="identificador" class="form-label">CIUL o CUIT</label>
        <input v-model="identificador" type="text" class="form-control" required />
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="text-danger mb-3">{{ error }}</div>

      <button type="submit" class="btn btn-primary">Consultar</button>
    </form>

    <!-- Tabla de resultados -->
    <div v-if="servicios.length" class="mt-5">
      <h4>Servicios asociados</h4>
      <table class="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Estado</th>
            <th>Último pago</th>
            <th>Deuda</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in servicios" :key="s.id">
            <td>{{ s.tipo }}</td>
            <td>{{ s.estado }}</td>
            <td>{{ s.ultimo_pago }}</td>
            <td>{{ s.deuda }} ARS</td>
            <td>
              <!-- Botón de pago si el servicio es pagable -->
              <button
                v-if="s.pagable"
                class="btn btn-sm btn-success"
                @click="iniciarPago(s)"
              >
                Pagar
              </button>
              <span v-else class="text-muted">No disponible</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </baseLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import baseLayout from '@/layouts/baseLayout.vue';

const identificador = ref('');
const servicios = ref([]);
const error = ref('');
const router = useRouter();

// Consulta al backend por CIUL o CUIT
const consultarServicios = async () => {
  error.value = '';
  servicios.value = [];

  if (!identificador.value || identificador.value.length < 8) {
    error.value = 'Ingresá un CIUL o CUIT válido.';
    return;
  }

  try {
    const res = await fetch(`/api/consultas/servicios?identificador=${identificador.value}`);
    const data = await res.json();

    if (res.ok && data.length) {
      servicios.value = data;
    } else {
      error.value = 'No se encontraron servicios asociados.';
    }
  } catch (err) {
    error.value = 'Error al consultar servicios.';
  }
};

// Redirige a la vista de pago
const iniciarPago = (servicio) => {
  router.push(`/pago/${servicio.id}`);
};
</script>
