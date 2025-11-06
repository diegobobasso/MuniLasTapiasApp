
// 📁 composables/useArchivoUploader.js

/**
 * Subida institucional de archivos vinculados a una entidad.
 * @param {string} entidad - Ej: 'inspeccion', 'vecino', 'tramite'
 * @param {number} origenId - ID del registro origen
 * @param {File} archivo - Archivo PDF a subir
 * @returns {Promise<object>} - Respuesta del backend (archivo insertado o error)
 */
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
