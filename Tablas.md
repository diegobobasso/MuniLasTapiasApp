# 🗄️ Estructura institucional de la base de datos `municipalidad`

Este documento describe las tablas del sistema municipal, sus claves, relaciones y propósito institucional.

---

## 🧑‍🤝‍🧑 `vecinos`

- **Propósito:** Registro de ciudadanos vinculados a trámites, terrenos, negocios, denuncias, etc.
- **Claves:** `id` (PK)
- **Campos clave:** `dni`, `cuil_cuit`, `email`
- **Relaciones:** Referenciado por `terrenos`, `negocios`, `tramites`, `sugerencias`, `denuncias`

---

## 🏘️ `terrenos`

- **Propósito:** Registro de propiedades con superficie, estado y titularidad
- **Claves:** `id` (PK), `propietario_id`, `representante_id` (FK → vecinos)
- **Relaciones:** Referenciado por `negocios`, `inspecciones`, `denuncias`, `conexiones_agua`, `tasas_municipales`

---

## 🏢 `negocios`

- **Propósito:** Registro de actividades comerciales vinculadas a vecinos y terrenos
- **Claves:** `id` (PK), `titular_id` (FK → vecinos), `terreno_id` (FK → terrenos)
- **Relaciones:** Referenciado por `inspecciones`, `denuncias`, `tasas_municipales`

---

## 📝 `tramites`

- **Propósito:** Seguimiento de gestiones institucionales iniciadas por vecinos
- **Claves:** `id` (PK), `vecino_id` (FK → vecinos)

---

## 🚨 `denuncias`

- **Propósito:** Registro de reclamos ciudadanos por canal, tipo y estado
- **Claves:** `id` (PK), `terreno_id`, `negocio_id` (FK)
- **Relaciones:** Vincula denuncias con propiedades o actividades

---

## 🕵️ `inspecciones`

- **Propósito:** Registro de inspecciones realizadas sobre terrenos o negocios
- **Claves:** `id` (PK), `terreno_id`, `negocio_id` (FK)
- **Campos clave:** `fecha_solicitud`, `fecha_realizacion`, `estado`, `resultado`

---

## 💬 `sugerencias`

- **Propósito:** Recepción de propuestas o comentarios ciudadanos
- **Claves:** `id` (PK), `vecino_id` (FK)

---

## 🎉 `eventos`

- **Propósito:** Registro de actividades comunitarias, institucionales o vecinales
- **Claves:** `id` (PK)
- **Campos clave:** `fecha`, `tipo`, `organizador`

---

## 💧 `conexiones_agua`

- **Propósito:** Gestión de conexiones de agua por terreno
- **Claves:** `id` (PK), `terreno_id` (FK)
- **Campos clave:** `estado`, `medidor`, `uso_especial`

---

## 💰 `tasas_municipales`

- **Propósito:** Registro de tasas emitidas por terreno o negocio
- **Claves:** `id` (PK), `terreno_id`, `negocio_id` (FK)
- **Campos clave:** `tipo`, `estado`, `periodo`, `monto`

---

## 🔐 `empleados`

- **Propósito:** Gestión de usuarios institucionales con roles y acceso
- **Claves:** `id` (PK), `email` (UNIQUE)
- **Campos clave:** `rol`, `password_hash`

---

## 📦 `archivos`

- **Propósito:** Vinculación de archivos PDF a entidades institucionales
- **Claves:** `id` (PK)
- **Campos clave:** `entidad_origen`, `origen_id`, `nombre_archivo`, `ruta_archivo`, `fecha_subida`

---

## 🧾 `archivos_eliminados`

- **Propósito:** Registro de eliminaciones manuales o automáticas de archivos
- **Claves:** `id` (PK), `archivo_id` (referencia lógica)
- **Campos clave:** `entidad_origen`, `origen_id`, `motivo`, `fecha_eliminacion`

---


