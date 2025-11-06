<template>
  <div class="container py-4">
    <h2 class="text-center mb-4">Autoridades Municipales</h2>
    <div class="row">
      <div class="col-md-4" v-for="autoridad in autoridades" :key="autoridad.id">
        <div class="card mb-3">
          <img :src="autoridad.foto" class="card-img-top" alt="Foto autoridad" />
          <div class="card-body">
            <h5 class="card-title">{{ autoridad.nombre }}</h5>
            <p class="card-text">{{ autoridad.cargo }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const autoridades = ref([]);

onMounted(async () => {
  const res = await fetch('/api/autoridades');
  autoridades.value = await res.json();
});
</script>