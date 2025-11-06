<<template>
  <adminLayout>
    <h2 class="mb-4">Gestión de vecinos</h2>

    <!-- Formulario de alta institucional -->
    <form @submit.prevent="crearVecino" class="mb-4" style="max-width: 700px">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Nombre</label>
          <input v-model="nuevo.nombre" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Apellido</label>
          <input v-model="nuevo.apellido" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">DNI</label>
          <input v-model="nuevo.dni" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">CUIL / CUIT</label>
          <input v-model="nuevo.cuil_cuit" class="form-control" />
        </div>
        <div class="col-md-12 mb-3">
          <label class="form-label">Domicilio</label>
          <input v-model="nuevo.domicilio" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Teléfono</label>
          <input v-model="nuevo.telefono" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Email</label>
          <input v-model="nuevo.email" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Contraseña inicial</label>
          <input v-model="nuevo.password" type="password" class="form-control" />
        </div>
      </div>
      <button class="btn btn-success">Agregar vecino</button>
    </form>

    <!-- Tabla institucional de vecinos -->
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>DNI</th>
          <th>CUIL/CUIT</th>
          <th>Domicilio</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>Archivo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="v in vecinos" :key="v.id">
          <td>{{ v.id }}</td>
          <td>{{ v.nombre }}</td>
          <td>{{ v.apellido }}</td>
          <td>{{ v.dni }}</td>
          <td>{{ v.cuil_cuit }}</td>
          <td>{{ v.domicilio }}</td>
          <td>{{ v.telefono }}</td>
          <td>{{ v.email }}</td>
          <td><archivoEntidad entidad="vecino" :origen-id="v.id" /></td>
          <td>
            <button @click="restaurarClave(v.id)" class="btn btn-sm btn-warning">Restaurar clave</button>
          </td>
        </tr>
      </tbody>
    </table>
  </adminLayout>
</template>

<script setup>
// Componente institucional para empleados
// Permite alta de vecinos y restauración de contraseña

import { ref, onMounted } from 'vue';
import archivoEntidad from '@/components/archivoEntidad.vue';
import adminLayout from '@/layouts/adminLayout.vue';

const vecinos = ref([]);
const nuevo = ref({
  nombre: '', apellido: '', dni: '', cuil_cuit: '',
  domicilio: '', telefono: '', email: '', password: ''
});

const token = localStorage.getItem('token');

/**
 * Cargar vecinos al iniciar
 */
onMounted(async () => {
  const res = await fetch('/api/vecinos', {
    headers: { Authorization: `Bearer ${token}` }
  });
  vecinos.value = await res.json();
});

/**
 * Crear nuevo vecino institucional
 */
async function crearVecino() {
  const res = await fetch('/api/vecinos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(nuevo.value)
  });

  const data = await res.json();
  if (res.ok) {
    vecinos.value.push(data);
    nuevo.value = {
      nombre: '', apellido: '', dni: '', cuil_cuit: '',
      domicilio: '', telefono: '', email: '', password: ''
    };
  } else {
    alert(data.error || 'Error al crear vecino');
  }
}

/**
 * Restaurar contraseña institucional
 */
async function restaurarClave(id) {
  const nuevaClave = prompt('Nueva contraseña para el vecino:');
  if (!nuevaClave) return;

  const res = await fetch(`/api/vecinos/restaurar-clave/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ nuevaClave })
  });

  if (res.ok) {
    alert('Contraseña restaurada correctamente');
  } else {
    const data = await res.json();
    alert(data.error || 'Error al restaurar contraseña');
  }
}
</script>
