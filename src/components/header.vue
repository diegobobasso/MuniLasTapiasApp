
       <!-- src/components/Header.vue -->
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
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
// No se necesita lógica por ahora
</script>

<style scoped>
/* Podés agregar estilos específicos si querés */
</style>
