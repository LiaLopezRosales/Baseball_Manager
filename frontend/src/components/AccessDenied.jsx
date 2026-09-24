import React from 'react';
import { Link } from 'react-router-dom';
import { getInitialTheme } from '../theme';
import './accessDenied.css';

/**
 * Pantalla para usuarios autenticados que no tienen el rol requerido.
 * Reemplaza la redirección silenciosa de ProtectedRoute.
 */
export default function AccessDenied({ role = '' }) {
  return (
    <div className="landing access-denied" data-theme={getInitialTheme()}>
      <div className="access-denied__card">
        <span className="material-symbols-outlined access-denied__icon" aria-hidden="true">
          lock
        </span>
        <h1 className="access-denied__title">Acceso restringido</h1>
        <p className="access-denied__text">
          Tu cuenta{role ? ` (${role})` : ''} no tiene permisos para esta sección.
          Si crees que es un error, contacta al administrador de la liga.
        </p>
        <Link to="/" className="access-denied__cta">
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_back
          </span>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
