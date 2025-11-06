// src/services/authService.js

/**
 * 🔐 Servicio institucional de autenticación
 * Centraliza login, logout, expiración y acceso al usuario
 */

const TOKEN_KEY = 'token';
const USUARIO_KEY = 'usuario';

/**
 * Inicia sesión institucional
 * @param {string} email
 * @param {string} password
 * @returns {Promise<boolean>} true si login exitoso
 */
export async function login(email, password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) return false;

  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USUARIO_KEY, JSON.stringify(data.usuario));
  return true;
}

/**
 * Cierra sesión institucional
 * Limpia token y datos del usuario
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
  window.location.href = '/login';
}

/**
 * Devuelve el token actual
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Devuelve el usuario actual
 * @returns {object|null}
 */
export function getUsuario() {
  const raw = localStorage.getItem(USUARIO_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Verifica si el token está expirado
 * @returns {boolean}
 */
export function isTokenExpired() {
  const token = getToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (err) {
    return true;
  }
}
