import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AccessDenied from './AccessDenied';
import { useAuthModal, REDIRECT_AFTER_LOGIN_KEY } from '../authModal';

/**
 * ProtectedRoute: exige un rol para renderizar `children`.
 * - Invitado: guarda el destino, abre el modal de login y vuelve a "/".
 * - Autenticado con rol insuficiente: muestra "Acceso restringido".
 *
 * Uso:
 *   <ProtectedRoute roles={['Admin']}><AdminLayout /></ProtectedRoute>
 */
export default function ProtectedRoute({ roles, children }) {
  const location = useLocation();
  const { openLogin } = useAuthModal();
  const role = localStorage.getItem('role') || '';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      localStorage.setItem(
        REDIRECT_AFTER_LOGIN_KEY,
        location.pathname + location.search
      );
      openLogin();
    }
  }, [token, location.pathname, location.search, openLogin]);

  if (token && roles.includes(role)) return children;
  if (!token) return <Navigate to="/" replace />;
  return <AccessDenied role={role} />;
}
