# MuniLasTapiasHTML
Prueba para la Municipalidad


# 📁 Módulo Institucional de Gestión de Archivos

Este módulo permite vincular, auditar y limpiar archivos PDF asociados a entidades como inspecciones, vecinos, trámites, terrenos, etc. Está diseñado para cumplir con estándares de trazabilidad, seguridad y mantenimiento institucional.

---

## 🔧 API: `/api/archivos`

### 📤 Subida de archivo

- **Método:** `POST`
- **Autenticación:** Requiere token JWT
- **Formato:** `multipart/form-data`
- **Campos requeridos:**
  - `entidad_origen`: string (`inspeccion`, `vecino`, `tramite`, etc.)
  - `origen_id`: número (ID del registro origen)
  - `archivo`: archivo PDF

### 🧠 Validaciones

- Se rechazan archivos duplicados por `nombre_archivo`, `entidad_origen` y `origen_id`
- Se permite subir múltiples archivos por entidad sin reemplazo automático
- Se registra `fecha_subida` y `tipo_mime` para auditoría

### 🗑️ Eliminación

- **Método:** `DELETE /api/archivos/:id`
- Elimina el archivo físico y su registro en la base de datos
- Registra la eliminación en la tabla `archivos_eliminados` con motivo `manual`

### 📄 Listado

- **Método:** `GET /api/archivos`
- Devuelve todos los archivos ordenados por fecha

---

## 🧩 Composable: `useArchivoUploader.js`

Ubicado en `src/composables/`, permite subir archivos desde cualquier componente Vue.

```js
export async function subirArchivo(entidad, origenId, archivo) {
  const formData = new FormData();
  formData.append('entidad_origen', entidad);
  formData.append('origen_id', origenId);
  formData.append('archivo', archivo);

  const res = await fetch('/api/archivos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al subir archivo');
  return data;
}
```

### Ejemplo de uso:

```js
import { subirArchivo } from '@/composables/useArchivoUploader.js';

const resultado = await subirArchivo('inspeccion', 12, archivoSeleccionado);
```

---

## 🧱 Componente: `archivoEntidad.vue`

Componente reutilizable para vincular archivos a cualquier entidad. Recibe `entidad` e `origenId` como props y permite:

- Mostrar todos los archivos vinculados
- Subir nuevos archivos sin reemplazar
- Eliminar archivos individualmente

Se usa en vistas como `gestionInspecciones.vue`, `gestionVecinos.vue`, etc.

---

## 🧾 Vista: `gestionArchivos.vue`

Vista institucional para auditar todos los archivos del sistema. Incluye:

- Filtros por entidad y fecha
- Tabla con nombre, ruta, fecha y estado
- Detección de archivos huérfanos (sin entidad válida)
- Detección de duplicados (mismo nombre por entidad e ID)
- Eliminación manual por ID

---

## 🧼 Limpieza institucional: `scripts/limpiarArchivos.js`

Script ejecutable que elimina archivos innecesarios.

### Funciones incluidas:

- `limpiarHuerfanos()` → elimina archivos cuyo `origen_id` ya no existe en su tabla
- `limpiarDuplicados()` → elimina archivos con mismo `nombre_archivo`, `entidad_origen` y `origen_id`, conservando el más antiguo

### Trazabilidad:

- Registra cada eliminación en:
  - Archivo físico: `logs/limpieza.log`
  - Tabla: `archivos_eliminados`
- Motivos registrados: `huérfano`, `duplicado`

### Ejecución manual:

```bash
node scripts/limpiarArchivos.js
```

> ⚠️ No se expone vía API. Solo personal técnico autorizado puede ejecutarlo.

---

## 🧾 Trazabilidad de eliminaciones

Todas las eliminaciones de archivos se registran en la tabla `archivos_eliminados`, incluyendo:

- Eliminaciones por limpieza (`huérfano`, `duplicado`)
- Eliminaciones manuales desde el panel admin (`manual`)

Campos registrados:

- `archivo_id`, `entidad_origen`, `origen_id`
- `nombre_archivo`, `ruta_archivo`
- `motivo`, `fecha_eliminacion`

---

## 📁 Estructura de carpetas requerida

- `public/uploads/` → carpeta raíz para archivos subidos
  - Subcarpetas por entidad se crean automáticamente (`inspeccion`, `vecino`, etc.)
- `logs/` → carpeta para registrar limpieza (`limpieza.log`)

```bash
mkdir -p public/uploads
mkdir logs
```

---

## 🛡️ Seguridad institucional

- Todas las rutas están protegidas con `verificarToken`
- La limpieza no está expuesta por API
- El sistema está preparado para auditoría externa y mantenimiento técnico
