<template>
  <div class="mb-4">
    <h5>Archivos vinculados</h5>

    <!-- Lista de archivos existentes -->
    <ul v-if="archivos.length">
      <li v-for="a in archivos" :key="a.id" class="mb-2">
        <strong>{{ a.nombre_archivo }}</strong> ({{ a.fecha_subida }})
        <a :href="a.ruta_archivo" target="_blank" class="btn btn-sm btn-outline-primary ms-2">Ver</a>
        <button class="btn btn-sm btn-outline-danger ms-2" @click="eliminarArchivo(a.id)">Eliminar</button>
      </li>
    </ul>
    <p v-else>No hay archivos vinculados.</p>

    <!-- Subida de nuevo archivo -->
    <form @submit.prevent="subirArchivo" enctype="multipart/form-data" class="mt-3">
      <input type="file" @change="handleFile" accept="application/pdf" class="form-control mb-2" required />
      <button class="btn btn-sm btn-success">Subir nuevo archivo</button>
    </form>
  </div>
</template>

<script setup>
// Importar funciones de Vue
import { ref, onMounted, watch } from 'vue';

// Props recibidas desde la vista
const props = defineProps({
  entidad: String,     // Ej: 'inspeccion', 'vecino'
  origenId: Number     // Ej: 12
});

// Estado local
const archivos = ref([]);         // Lista de archivos vinculados
const archivoNuevo = ref(null);   // Archivo a subir

// Cargar archivos vinculados a la entidad e ID
async function cargarArchivos() {
  const res = await fetch('/api/archivos', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  const todos = await res.json();
  archivos.value = todos.filter(a => a.entidad_origen === props.entidad && a.origen_id === props.origenId);
}

// Ejecutar al montar y al cambiar el ID
onMounted(cargarArchivos);
watch(() => props.origenId, cargarArchivos);

// Capturar archivo desde input
function handleFile(e) {
  archivoNuevo.value = e.target.files[0];
}

// Subir nuevo archivo sin reemplazar
async function subirArchivo() {
  const formData = new FormData();
  formData.append('entidad_origen', props.entidad);
  formData.append('origen_id', props.origenId);
  formData.append('archivo', archivoNuevo.value);

  const res = await fetch('/api/archivos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: formData
  });

  const data = await res.json();
  if (res.ok) {
    archivos.value.push(data); // Agregar nuevo archivo a la lista
    archivoNuevo.value = null;
  } else {
    alert(data.error || 'Error al subir archivo');
  }
}

// Eliminar archivo individual
async function eliminarArchivo(id) {
  if (!confirm('¿Eliminar este archivo?')) return;

  const res = await fetch(`/api/archivos/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  if (res.ok) {
    archivos.value = archivos.value.filter(a => a.id !== id);
  } else {
    alert('Error al eliminar archivo');
  }
}
</script>
