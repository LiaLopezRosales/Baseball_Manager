/**
 * Claves de localStorage que pertenecen a la sesión autenticada.
 * `clearSession` las elimina sin tocar preferencias como el tema.
 */
export const SESSION_KEYS = [
  'token',
  'isLogged',
  'role',
  'role_name',
  'team',
  'team_id',
  'permissions',
  'userName',
  'redirectAfterLogin',
];

export function clearSession() {
  SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
}
