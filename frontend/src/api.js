/**
 * Cliente API centralizado.
 * Usa REACT_APP_API_URL desde .env con fallback a localhost de desarrollo.
 */
export const API_URL =
  process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

/**
 * Error con el status HTTP de la respuesta (para distinguir 401, 404, …).
 */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * GET a un endpoint de la API. Devuelve el JSON parseado.
 * Lanza un error con un mensaje legible si la respuesta no es OK.
 */
export async function apiGet(path) {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Token ${token}`;
  const res = await fetch(`${API_URL}${path}`, { headers });
  if (!res.ok) {
    throw new ApiError(`Error ${res.status} al consultar ${path}`, res.status);
  }
  return res.json();
}

/**
 * POST a un endpoint de la API con token de autenticación si existe.
 */
export async function apiPost(path, body = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Token ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Error ${res.status} al enviar a ${path}`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch {
      /* sin cuerpo JSON */
    }
    throw new ApiError(message, res.status);
  }
  return res.json();
}

/**
 * DELETE a un endpoint con token de autenticación.
 */
export async function apiDelete(path) {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Token ${token}`;
  const res = await fetch(`${API_URL}${path}`, { method: 'DELETE', headers });
  if (!res.ok) {
    let message = `Error ${res.status} al eliminar ${path}`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch { /* vacío */ }
    throw new ApiError(message, res.status);
  }
}

/**
 * Obtiene el listado de una tabla CRUD (DRF pagina a través de `results`).
 */
export async function fetchTable(path) {
  const data = await apiGet(path);
  return Array.isArray(data) ? data : data.results || [];
}
