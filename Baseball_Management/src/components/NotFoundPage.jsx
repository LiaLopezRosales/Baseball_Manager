import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LandingHeader from './landing/LandingHeader';
import LandingFooter from './landing/LandingFooter';
import { getInitialTheme, applyTheme } from '../theme';
import './notFoundPage.css';

function NotFoundPage({ isLogged = false, userName = '', role = '', onModalOpen, onRegisterOpen, onLogout }) {
  const [theme, setThemeState] = useState(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  };

  return (
    <div className="landing nf" data-theme={theme}>
      <LandingHeader
        isLogged={isLogged}
        userName={userName}
        role={role}
        theme={theme}
        onThemeChange={toggleTheme}
        onModalOpen={onModalOpen}
        onRegisterOpen={onRegisterOpen}
        onLogout={onLogout}
      />

      <main className="nf__main">
        <p className="nf__code" aria-hidden="true">
          404
        </p>
        <h1 className="nf__title">Página no encontrada</h1>
        <p className="nf__lead">
          La dirección que intentas abrir no existe o fue movida. Revisa el
          enlace o vuelve a la portada para seguir explorando la liga.
        </p>
        <div className="nf__actions">
          <Link to="/" className="landing__btn landing__btn--solid">
            <span className="material-symbols-outlined" aria-hidden="true">
              home
            </span>
            Volver al inicio
          </Link>
          <Link to="/reporte/equipos-ganadores" className="landing__btn landing__btn--ghost">
            <span className="material-symbols-outlined" aria-hidden="true">
              query_stats
            </span>
            Explorar reportes
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

export default NotFoundPage;