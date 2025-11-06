<template>
  <baseLayout>
    <h2 class="text-center mb-4">Ingreso institucional</h2>

    <!-- Formulario de login institucional -->
    <form @submit.prevent="iniciarSesion" class="mx-auto" style="max-width: 400px">
      <div class="mb-3">
        <label for="email" class="form-label">Email institucional</label>
        <input
          v-model="email"
          type="email"
          class="form-control"
          required
          placeholder="usuario@municipio.gob.ar"
        />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input
          v-model="password"
          type="password"
          class="form-control"
          required
          placeholder="••••••••"
        />
      </div>

      <div v-if="error" class="text-danger mb-3">
        {{ error }}
      </div>

      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        {{ loading ? 'Ingresando...' : 'Ingresar' }}
      </button>
    </form>
  </baseLayout>
</template>

<script setup>
// Componente institucional de login
// Usa authService para gestionar sesión y redirigir según rol

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import baseLayout from '@/layouts/baseLayout.vue';
import { login as loginService, getUsuario } from '@/services/authService.js';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();

/**
 * Inicia sesión institucional usando authService
 */
const iniciarSesion = async () => {
  error.value = '';
  loading.value = true;

  if (!email.value || !password.value) {
    error.value = 'Completá todos los campos.';
    loading.value = false;
    return;
  }

  const ok = await loginService(email.value, password.value);

  if (ok) {
    const usuario = getUsuario();
    const destino = usuario.rol === 'admin' ? '/panel' : '/panel';
    router.push(destino);
  } else {
    error.value = 'Credenciales inválidas o usuario no autorizado.';
  }

  loading.value = false;
};
</script>
