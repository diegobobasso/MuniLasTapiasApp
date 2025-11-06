<template>
  <adminLayout>
    <h2 class="mb-4">Gestión de archivos institucionales</h2>

    <!-- Formulario de subida manual -->
    <form @submit.prevent="subirArchivo" class="mb-4" enctype="multipart/form-data" style="max-width: 600px">
      <div class="mb-3">
        <label class="form-label">Entidad origen</label>
        <select v-model="form.entidad_origen" class="form-select" required>
          <option value="inspeccion">Inspección</option>
          <option value="tramite">Trámite</option>
          <option value="sugerencia">Sugerencia</option>
          <option value="negocio">Negocio</option>
          <option value="terreno">Terreno</option>
          <option value="vecino">Vecino</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">ID de origen</label>
        <input v-model="form.origen_id" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Archivo PDF</label>
        <input type="file" @change="handleFile" accept="application/pdf" class="form-control" required />
      </div>
      <button class="btn btn-success">Subir archivo</button>
    </form>

    <!-- Filtros de auditoría -->
    <div class="row mb-4">
      <div class="col-md-3">
        <label class="form-label">Filtrar por entidad</label>
        <select v-model="filtroEntidad" class="form-select">
          <option value="">Todas</option>
          <option value="inspeccion">Inspección</option>
          <option value="tramite">Trámite</option>
          <option value="sugerencia">Sugerencia</option>
          <option value="negocio">Negocio</option>
          <option value="terreno">Terreno</option>
          <option value="vecino">Vecino</option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Desde</label>
        <input type="date" v-model="filtroDesde" class="form-control" />
      </div>
      <div class="col-md-3">
        <label class="form-label">Hasta</label>
        <input type="date" v-model="filtroHasta" class="form-control" />
      </div>
    </div>

    <!-- Tabla de archivos -->
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>Entidad</th>
          <th>Origen</th>
          <th>Nombre</th>
          <th>Ruta</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in archivosFiltrados" :key="a.id">
          <td>{{ a.id }}</td>
          <td>{{ a.entidad_origen }}</td>
          <td>{{ a.origen_id }}</td>
          <td>{{ a.nombre_archivo }}</td>
          <td><a :href="a.ruta_archivo" target="_blank">Ver</a></td>
          <td>{{ a.fecha_subida }}</td>
          <td>
            <!-- Estado de auditoría -->
            <span v-if="esHuerfano(a)" class="text-danger">Huérfano</span>
            <span v-else-if="esDuplicado(a)" class="text-warning">Duplicado</span>
            <span v-else class="text-success">OK</span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-danger" @click="eliminarArchivo(a.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </adminLayout>
</template>

<script setup>
// Importar funciones de Vue y layout
import { ref, computed, onMounted } from 'vue';
import adminLayout from '@/layouts/adminLayout.vue';

// Estado principal
const archivos = ref([]);
const form = ref({ entidad_origen: '', origen_id: '' });
const archivo = ref(null);

// Filtros de auditoría
const filtroEntidad = ref('');
const filtroDesde = ref('');
const filtroHasta = ref('');

// Cargar todos los archivos al montar
onMounted(async () => {
  const res = await fetch('/api/archivos', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  archivos.value = await res.json();
});

// Capturar archivo desde input
function handleFile(e) {
  archivo.value = e.target.files[0];
}

// Subir nuevo archivo
async function subirArchivo() {
  const formData = new FormData();
  formData.append('entidad_origen', form.value.entidad_origen);
  formData.append('origen_id', form.value.origen_id);
  formData.append('archivo', archivo.value);

  const res = await fetch('/api/archivos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: formData
  });

  const data = await res.json();
  if (res.ok) {
    archivos.value.push(data);
    form.value = { entidad_origen: '', origen_id: '' };
    archivo.value = null;
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

// Computar archivos filtrados por entidad y fecha
const archivosFiltrados = computed(() => {
  return archivos.value.filter(a => {
    const fecha = new Date(a.fecha_subida).toISOString().slice(0, 10);
    const entidadOk = !filtroEntidad.value || a.entidad_origen === filtroEntidad.value;
    const desdeOk = !filtroDesde.value || fecha >= filtroDesde.value;
    const hastaOk = !filtroHasta.value || fecha <= filtroHasta.value;
    return entidadOk && desdeOk && hastaOk;
  });
});

// Detectar si el archivo está huérfano (simulado)
function esHuerfano(a) {
  // Simulación: si origen_id es mayor a 9999, asumimos que no existe
  return a.origen_id > 9999;
}

// Detectar si hay duplicados por nombre, entidad y origen
function esDuplicado(a) {
  return archivos.value.filter(b =>
    b.entidad_origen === a.entidad_origen &&
    b.origen_id === a.origen_id &&
    b.nombre_archivo === a.nombre_archivo
  ).length > 1;
}
</script>
