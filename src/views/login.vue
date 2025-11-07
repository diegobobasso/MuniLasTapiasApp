<template>
  <baseLayout>
    <h2 class="text-center mb-4">Ingreso institucional</h2>

    <!-- 🛠 Primer ingreso: creación de superadministrador -->
    <FormularioBootstrap v-if="sistemaVirgen" @creado="sistemaVirgen = false" />

    <!-- 🔐 Login normal -->
    <form v-else @submit.prevent="iniciarSesion" class="mx-auto" style="max-width: 400px">
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import baseLayout from '@/layouts/baseLayout.vue';
import FormularioBootstrap from '@/components/FormularioBootstrap.vue';
import {
  login as loginService,
  getUsuario,
  verificarSistemaVirgen
} from '@/services/authService.js';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const sistemaVirgen = ref(false);
const router = useRouter();

/**
 * Detecta si el sistema está virgen
 */
onMounted(async () => {
  try {
    const estado = await verificarSistemaVirgen();
    sistemaVirgen.value = estado.sistemaVirgen;
  } catch (err) {
    console.error('Error al verificar estado del sistema:', err);
  }
});

/**
 * Inicia sesión institucional
 */
const iniciarSesion = async () => {
  error.value = '';
  loading.value = true;

  const ok = await loginService(email.value, password.value);

  if (ok) {
    const usuario = getUsuario();
    router.push('/panel');
  } else {
    error.value = 'Credenciales inválidas o usuario no autorizado.';
  }

  loading.value = false;
};
</script>

