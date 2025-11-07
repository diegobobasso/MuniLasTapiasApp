<template>
  <form @submit.prevent="crear" class="mx-auto" style="max-width: 400px">
    <div class="mb-3">
      <label for="username" class="form-label">Nombre de usuario</label>
      <input
        v-model="username"
        type="text"
        class="form-control"
        required
        placeholder="admin"
      />
    </div>

    <div class="mb-3">
      <label for="password" class="form-label">Contraseña inicial</label>
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

    <div v-if="exito" class="alert alert-success">
      Superadministrador creado correctamente. Ahora podés iniciar sesión.
    </div>

    <button type="submit" class="btn btn-success w-100" :disabled="loading">
      {{ loading ? 'Creando...' : 'Crear superadministrador' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { crearSuperadmin } from '@/services/authService.js';

const emit = defineEmits(['creado']);

const username = ref('');
const password = ref('');
const error = ref('');
const exito = ref(false);
const loading = ref(false);

const crear = async () => {
  error.value = '';
  exito.value = false;
  loading.value = true;

  if (!username.value || !password.value) {
    error.value = 'Completá todos los campos.';
    loading.value = false;
    return;
  }

  const ok = await crearSuperadmin(username.value, password.value);

  if (ok) {
    exito.value = true;
    emit('creado'); // notifica al padre que fue creado
  } else {
    error.value = 'Error al crear el superadministrador.';
  }

  loading.value = false;
};
</script>
