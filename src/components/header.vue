<template>
  <header>
    <nav class="navbar navbar-expand-xl bgdwhite">
      <div class="container">
        <!-- Logo como botón al Home -->
        <RouterLink class="navbar-brand txtblack" to="/">
          <img src="/multimedia/img/LOGO MUNI LAS TAPIAS.jpg" alt="Logo" width="70" height="70" class="d-inline-block align-text-center" />
          Municipalidad de Las Tapias
        </RouterLink>

        <!-- Botón hamburguesa para móviles -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Menú de navegación -->
        <div class="collapse navbar-collapse col-8 txtgrey" id="navbarSupportedContent">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <RouterLink class="nav-link txtgrey" to="/noticias">Noticias</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link txtgrey" to="/ordenanzas">Ordenanzas</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link txtgrey" to="/visita">Visita Las Tapias</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link txtgrey" to="/autoridades">Autoridades</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link txtgreen" to="/contacto">Contacto</RouterLink>
            </li>

            <!-- 👤 Usuario logueado -->
            <li v-if="usuario" class="nav-item d-flex align-items-center me-3 txtgrey">
              <span class="small">👤 {{ usuario.nombre }}</span>
            </li>

            <!-- 🔐 Login / Logout dinámico -->
            <li class="nav-item">
              <RouterLink v-if="!autenticado" class="btn btn-outline-primary" to="/login">Login</RouterLink>
              <button v-else class="btn btn-outline-danger" @click="logout">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
// Header institucional con login/logout y nombre del usuario

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { logout as cerrarSesion, getUsuario, getToken } from '@/services/authService.js';

const router = useRouter();
const autenticado = ref(false);
const usuario = ref(null);

// Detecta si hay token y carga usuario
onMounted(() => {
  autenticado.value = !!getToken();
  usuario.value = getUsuario();
});

/**
 * Cierra sesión institucional
 */
function logout() {
  cerrarSesion();
}
</script>

<style scoped>
/* Podés agregar estilos específicos si querés */
</style>
