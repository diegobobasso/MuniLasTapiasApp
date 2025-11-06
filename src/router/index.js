import { createRouter, createWebHistory } from 'vue-router';
import { isTokenExpired, logout } from '@/services/authService.js'; // 🔐 Servicio centralizado

// Vistas públicas (vecinos)
import Home from '@/views/home.vue';
import Noticias from '@/views/noticias.vue';
import Ordenanzas from '@/views/ordenanzas.vue';
import Visita from '@/views/visita.vue';
import Autoridades from '@/views/autoridades.vue';
import Contacto from '@/views/contacto.vue';
import Gracias from '@/views/gracias.vue';
import Error from '@/views/error.vue';
import consultaServicios from '@/views/consultaServicios.vue';
import pagoPendiente from '@/views/pagoPendiente.vue';
import login from '@/views/login.vue';

// Vistas protegidas (empleados y admin)
import panelInstitucional from '@/views/panelInstitucional.vue';
import gestionTramites from '@/views/gestionTramites.vue';
import gestionSugerencias from '@/views/gestionSugerencias.vue';
import gestionVecinos from '@/views/gestionVecinos.vue';
import gestionArticulos from '@/views/gestionArticulos.vue';
import gestionEmpleados from '@/views/gestionEmpleados.vue';

// 🔍 Extrae usuario desde localStorage
const getUsuario = () => {
  const raw = localStorage.getItem('usuario');
  return raw ? JSON.parse(raw) : null;
};

// 🔐 Middleware institucional de protección por token y rol
const requireAuth = (to, from, next) => {
  const token = localStorage.getItem('token');
  const usuario = getUsuario();

  if (!token || !usuario) {
    return next('/login');
  }

  const ruta = to.path;

  // Rutas exclusivas para admin
  const soloAdmin = ['/panel/articulos', '/panel/empleados'];
  if (soloAdmin.includes(ruta) && usuario.rol !== 'admin') {
    return next('/panel');
  }

  // Rutas exclusivas para empleados
  const soloEmpleado = ['/panel/vecinos'];
  if (soloEmpleado.includes(ruta) && usuario.rol !== 'empleado') {
    return next('/panel');
  }

  next(); // acceso permitido
};

// 📦 Definición de rutas
const routes = [
  // 🔓 Rutas públicas
  { path: '/', component: Home },
  { path: '/noticias', component: Noticias },
  { path: '/ordenanzas', component: Ordenanzas },
  { path: '/visita', component: Visita },
  { path: '/autoridades', component: Autoridades },
  { path: '/contacto', component: Contacto },
  { path: '/gracias', component: Gracias },
  { path: '/error', component: Error },
  { path: '/servicios', component: consultaServicios },
  { path: '/pago/:id', component: pagoPendiente },
  { path: '/login', component: login },

  // 🔐 Rutas protegidas (empleados y admin)
  { path: '/panel', component: panelInstitucional, beforeEnter: requireAuth },
  { path: '/panel/tramites', component: gestionTramites, beforeEnter: requireAuth },
  { path: '/panel/sugerencias', component: gestionSugerencias, beforeEnter: requireAuth },
  { path: '/panel/vecinos', component: gestionVecinos, beforeEnter: requireAuth },
  { path: '/panel/articulos', component: gestionArticulos, beforeEnter: requireAuth },
  { path: '/panel/empleados', component: gestionEmpleados, beforeEnter: requireAuth }
];

// 🚀 Crear router institucional
const router = createRouter({
  history: createWebHistory(),
  routes
});

// 🔐 Middleware global para expiración automática del token
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  // Si la ruta requiere protección y no hay token
  const requiereProteccion = to.path.startsWith('/panel');
  if (requiereProteccion && !token) {
    return next('/login');
  }

  // Si el token existe pero está vencido
  if (token && isTokenExpired()) {
    alert('Tu sesión ha expirado. Por favor iniciá sesión nuevamente.');
    logout();
    return;
  }

  next(); // acceso permitido
});

export default router;


