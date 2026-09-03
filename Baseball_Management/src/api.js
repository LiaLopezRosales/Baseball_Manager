/**
 * Cliente API centralizado.
 * Usa REACT_APP_API_URL desde .env con fallback a localhost de desarrollo.
 */
export const API_URL =
  process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

/**
 * GET a un endpoint de la API. Devuelve el JSON parseado.
 * Lanza un error con un mensaje legible si la respuesta no es OK.
 */
export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al consultar ${path}`);
  }
  return res.json();
}

/**
 * Obtiene el listado de una tabla CRUD (DRF pagina a través de `results`).
 */
export async function fetchTable(path) {
  const data = await apiGet(path);
  return Array.isArray(data) ? data : data.results || [];
}
