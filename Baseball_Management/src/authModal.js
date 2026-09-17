import { createContext, useContext } from 'react';

/**
 * Contexto global para abrir los modales de autenticación desde cualquier
 * punto del árbol (p. ej. ProtectedRoute cuando un invitado entra a una ruta
 * protegida). App.js provee `openLogin` / `openRegister`.
 */
export const AuthModalContext = createContext({
  openLogin: () => {},
  openRegister: () => {},
});

export const useAuthModal = () => useContext(AuthModalContext);

export const REDIRECT_AFTER_LOGIN_KEY = 'redirectAfterLogin';
