<template>
  <baseLayout>
    <h2 class="text-center mb-4">Ingreso institucional</h2>

    <!-- Formulario de login -->
    <form @submit.prevent="login" class="mx-auto" style="max-width: 400px">
      <!-- Campo Email -->
      <div class="mb-3">
        <label for="email" class="form-label">Email institucional</label>
        <input v-model="email" type="email" class="form-control" required />
      </div>

      <!-- Campo Contraseña -->
      <div class="mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input v-model="password" type="password" class="form-control" required />
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="text-danger mb-3">{{ error }}</div>

      <!-- Botón de ingreso -->
      <button type="submit" class="btn btn-primary w-100">Ingresar</button>
    </form>
  </baseLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import baseLayout from '@/layouts/baseLayout.vue';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

// Validación y envío al backend
const login = async () => {
  error.value = '';

  // Validación básica
  if (!email.value || !password.value) {
    error.value = 'Completá todos los campos.';
    return;
  }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Guarda el token en localStorage
      localStorage.setItem('token', data.token);

      // Redirige al panel institucional
      router.push('/panel');
    } else {
      error.value = data.error || 'Credenciales inválidas.';
    }
  } catch (err) {
    error.value = 'Error de conexión con el servidor.';
  }
};
</script>

