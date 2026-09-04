import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute: redirige a "/" si el usuario no tiene el rol requerido.
 * Lee el rol de localStorage ('role').
 *
 * Uso:
 *   <Route path="/admin/:slug" element={<ProtectedRoute roles={['Admin']}><CRUDRoute /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ roles, children }) {
  const role = localStorage.getItem('role') || '';

  if (!roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
