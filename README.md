# 🏛️ Municipalidad de Las Tapias — Backend Institucional

Sistema modular, trazable y seguro para la gestión de empleados, vecinos y operaciones municipales. Compatible con auditorías, onboarding y CI.

---

## 📁 Estructura general

server/ 
├── config/ 
│ └── databaseConnection.js # Conexión MySQL y ejecución segura 
├── middleware/ 
│ 
├── authMiddleware.js # Autenticación y autorización por rol 
│ 
├── errorHandler.js # Manejo centralizado de errores 
│ 
└── verificarToken.js # Middleware institucional JWT 
├── routes/ 
│ 
└── empleados.js # CRUD completo de empleados 
├── utils/ 
│ 
└── logger.js # Logs de acceso y pruebas test/ 
├── empleados.test.js # Tests institucionales de empleados 
├── setupGlobal.js # Setup global: tokens, limpieza, cierre src/ 
├── pages/AdminEmpleados.vue # Frontend de gestión de empleados 
├── helpers/api.js # Cliente Axios con token institucional

Código

---

## 🔐 Autenticación y autorización

- JWT firmado con `JWT_SECRET`
- Middleware `verificarToken`:
  - Permite `/admin/bootstrap` sin token
  - Valida formato `Bearer <token>`
  - Asigna `req.empleado` y `req.user`
- Middleware `autorizarRoles(...roles)`:
  - Protege rutas según rol (`admin`, `empleado`, `vecino`)

---

## 🧾 Logger institucional

- `logAcceso(mensaje, usuario)` → guarda en `logs/accesos.log`
- `logTest(mensaje)` → guarda en `logs/test.log`
- Compatible con Mocha y CI
- Cierre automático en `after()` de tests

---

## 🧪 Tests institucionales

- `setupGlobal.js`:
  - Carga `.env` o `.env.test`
  - Genera tokens (`admin`, `empleado`, `vecino`)
  - Limpia tablas antes de test
  - Cierra `logger` y `pool MySQL` al final
- `empleados.test.js`:
  - Crear, listar, actualizar, restaurar clave, eliminar
  - Valida trazabilidad con `expectLogMatch(...)`

---

## 🧩 Base de datos

- MySQL con esquema `municipalidad_test`
- Tablas cubiertas:
  - `empleados`, `vecinos`, `sugerencias`, `noticias`, `tramites`, `negocios`, `terrenos`, `eventos`, `denuncias`, `inspecciones`, `archivos`, `conexiones`, `consultas_servicios`, `articulos`, `logs_acceso`
- Todas las consultas usan `ejecutarConsulta(sql, params)` desde `databaseConnection.js`

---

## 👨‍💼 Rutas de empleados (`/api/empleados`)

| Método | Ruta                         | Descripción                          | Protegido por |
|--------|------------------------------|--------------------------------------|----------------|
| GET    | `/`                          | Listar empleados activos             | admin          |
| GET    | `/:id`                       | Obtener empleado por ID              | admin          |
| POST   | `/`                          | Crear nuevo empleado                 | admin          |
| PUT    | `/:id`                       | Actualizar campos                    | admin          |
| PUT    | `/:id/restaurar-clave`       | Restaurar contraseña                 | admin          |
| DELETE | `/:id`                       | Desactivar (soft delete)             | admin          |

---

## 🖥️ Frontend: `AdminEmpleados.vue`

- Página de gestión de empleados
- Usa `getToken('admin')` para autenticación
- Consume rutas protegidas con Axios (`api.js`)
- Muestra lista, formulario de alta, edición y restauración de clave

---

## ✅ Seguridad y trazabilidad

- Todas las rutas protegidas por token y rol
- Logs de acceso en `logs/accesos.log`
- Errores capturados y devueltos con estructura clara
- Tests validan efectos en base y trazabilidad

---

## 🧩 Recomendaciones

- Usar `verificarToken` en producción
- Validar trazabilidad con `expectLogMatch(...)`
- Mantener `.env.test` separado para CI
- Agregar `vecinos.test.js` para cobertura completa

---