# Autenticación Institucional — Municipalidad de Las Tapias

Este sistema implementa autenticación basada en JWT para proteger rutas, vistas y operaciones según el rol del usuario.

## Componentes clave

- **Backend**
  - `verificarToken.js`: valida token JWT y registra trazabilidad
  - `requireRol.js`: protege rutas por rol (`admin`, `empleado`)

- **Frontend**
  - `authService.js`: centraliza login, logout, expiración y acceso al usuario
  - `router/index.js`: protege rutas y detecta expiración automática
  - `login.vue`: formulario institucional con redirección por rol
  - `Header.vue`: botón dinámico Login / Logout y nombre del usuario

## Roles definidos

- `admin`: acceso completo a panel y gestión institucional
- `empleado`: acceso a trámites, vecinos, inspecciones
- `vecino`: acceso público a información municipal

## Seguridad

- Todas las rutas protegidas requieren token válido
- Expiración automática integrada en el router
- Logout manual disponible en el header

## Escalabilidad

- Fácil agregar nuevos roles, vistas y validaciones
- Modularidad entre backend, frontend y servicios
- Preparado para auditoría y onboarding institucional

