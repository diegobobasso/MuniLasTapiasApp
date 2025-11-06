<template>
  <adminLayout>
    <h2 class="mb-4">Gestión de artículos</h2>

    <!-- Formulario de carga -->
    <form @submit.prevent="guardarArticulo" class="mx-auto" style="max-width: 600px">
      <div class="mb-3">
        <label for="titulo" class="form-label">Título</label>
        <input v-model="nuevo.titulo" type="text" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="imagen" class="form-label">URL de imagen</label>
        <input v-model="nuevo.imagen" type="text" class="form-control" />
      </div>

      <div class="mb-3">
        <label for="descripcion" class="form-label">Descripción</label>
        <textarea v-model="nuevo.descripcion" class="form-control" rows="5" required></textarea>
      </div>

      <div v-if="error" class="text-danger mb-3">{{ error }}</div>

      <button type="submit" class="btn btn-success">Guardar artículo</button>
    </form>
  </adminLayout>
</template>

<script setup>
import { ref } from 'vue';
import adminLayout from '@/layouts/adminLayout.vue';

const nuevo = ref({ titulo: '', imagen: '', descripcion: '' });
const error = ref('');

// Envío al backend con token
async function guardarArticulo() {
  error.value = '';

  try {
    const res = await fetch('/api/articulos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(nuevo.value)
    });

    if (res.ok) {
      alert('Artículo guardado');
      nuevo.value = { titulo: '', imagen: '', descripcion: '' };
    } else {
      const data = await res.json();
      error.value = data.error || 'Error al guardar';
    }
  } catch (err) {
    error.value = 'Error de conexión con el servidor.';
  }
}
</script>
