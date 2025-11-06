<template>
  <baseLayout>
    <h2 class="text-center mb-4">Formulario de contacto</h2>

    <form @submit.prevent="enviarSugerencia" class="mx-auto" style="max-width: 600px">
      <!-- Campo Nombre -->
      <div class="mb-3">
        <label for="nombre" class="form-label">Nombre</label>
        <input v-model="nombre" type="text" class="form-control" required />
      </div>

      <!-- Campo Email -->
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input v-model="email" type="email" class="form-control" required />
      </div>

      <!-- Campo Mensaje -->
      <div class="mb-3">
        <label for="mensaje" class="form-label">Mensaje</label>
        <textarea
          v-model="mensaje"
          class="form-control"
          rows="6"
          maxlength="5000"
          required
        ></textarea>
        <small class="text-muted">Entre 20 y 5000 caracteres</small>
      </div>

      <!-- Honeypot invisible para bots -->
      <input type="text" v-model="honeypot" style="display:none" autocomplete="off" />

      <!-- Mensaje de error -->
      <div v-if="error" class="text-danger mb-3">{{ error }}</div>

      <!-- Botón de envío -->
      <button type="submit" class="btn btn-primary">Enviar</button>
    </form>
  </baseLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import baseLayout from '@/layouts/baseLayout.vue';

const router = useRouter();

const nombre = ref('');
const email = ref('');
const mensaje = ref('');
const honeypot = ref('');
const error = ref('');

// Expresión regular para validar formato de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const enviarSugerencia = async () => {
  error.value = '';

  // Validación de campos obligatorios
  if (!nombre.value || !email.value || !mensaje.value) {
    error.value = 'Todos los campos son obligatorios.';
    return;
  }

  // Validación de nombre
  if (nombre.value.length < 2 || nombre.value.length > 100) {
    error.value = 'El nombre debe tener entre 2 y 100 caracteres.';
    return;
  }

  // Validación de email
  if (!emailRegex.test(email.value)) {
    error.value = 'El email ingresado no tiene un formato válido.';
    return;
  }

  // Validación de mensaje
  if (mensaje.value.length < 20 || mensaje.value.length > 5000) {
    error.value = 'El mensaje debe tener entre 20 y 5000 caracteres.';
    return;
  }

  // Envío al backend
  try {
    const res = await fetch('/api/sugerencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.value,
        email: email.value,
        mensaje: mensaje.value,
        honeypot: honeypot.value
      })
    });

    const data = await res.json();

    // Redirección según respuesta
    if (res.ok && data.success === true) {
      router.push('/gracias');
    } else {
      router.push('/error');
    }
  } catch (err) {
    console.error('Error de conexión:', err);
    router.push('/error');
  }
};
</script>
