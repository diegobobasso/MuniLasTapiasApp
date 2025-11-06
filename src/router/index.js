// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';

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

// Vistas protegidas (empleados)
import panelInstitucional from '@/views/panelInstitucional.vue';
import gestionTramites from '@/views/gestionTramites.vue';
import gestionSugerencias from '@/views/gestionSugerencias.vue';
import gestionVecinos from '@/views/gestionVecinos.vue';
import gestionArticulos from '@/views/gestionArticulos.vue';

// Middleware de protección
const requireAuth = (to, from, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    next(); // acceso permitido
  } else {
    next('/login'); // redirige si no hay token
  }
};

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

  // 🔐 Rutas protegidas (empleados)
  { path: '/panel', component: panelInstitucional, beforeEnter: requireAuth },
  { path: '/panel/tramites', component: gestionTramites, beforeEnter: requireAuth },
  { path: '/panel/sugerencias', component: gestionSugerencias, beforeEnter: requireAuth },
  { path: '/panel/vecinos', component: gestionVecinos, beforeEnter: requireAuth },
  { path: '/panel/articulos', component: gestionArticulos, beforeEnter: requireAuth }
];

export default createRouter({
  history: createWebHistory(),
  routes
});


