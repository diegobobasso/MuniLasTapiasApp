<template>
  <div class="carousel slide bg-dark" data-bs-ride="carousel">
    <div class="carousel-inner">
      <div class="carousel-item active">
        <img src="/multimedia/img/portal-municipalidad-las-tapias.jpg" class="img-fluid bgimagen" alt="Banner Las Tapias" />
        <div class="carousel-caption d-block d-md-block text-end tamres">
          <h1 class="card-title">LAS TAPIAS</h1>
          <p class="card-text">Las Tapias es una localidad situada en el departamento</p>
          <p class="card-text">San Javier, provincia de Córdoba, Argentina.</p>
          <p class="card-text">Se encuentra situada en el valle de Traslasierra,</p>
          <p class="card-text">sobre la ruta provincial 14, a 11 km de Villa Dolores</p>
          <p class="card-text">y a 184 km de la ciudad de Córdoba.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.bgimagen {
  max-height: 400px;
  object-fit: cover;
  width: 100%;
}
.tamres {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 1rem;
}
</style>
