import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applyTheme } from '../../theme';

const NAV = [
  { to: '/', label: 'Inicio' },
  { to: '/reporte/estadisticas-juegos-por-equipos', label: 'Posiciones' },
  { to: '/reporte/average', label: 'Líderes & Stats' },
  { to: '/consultas/Series', label: 'Series & Calendario' },
  { to: '/reporte/equipos-ganadores', label: 'Reportes Oficiales' },
  { to: '/comparar', label: 'Comparador', protect: true },
];

function LandingHeader({
  isLogged,
  userName,
  role,
  onModalOpen,
  onRegisterOpen,
  onLogout,
  theme,
  onThemeChange,
  onNameChange,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    onThemeChange?.(next);
  };

  const handleNavClick = (e, link) => {
    if (link.protect && !isLogged) {
      e.preventDefault();
      onModalOpen?.();
      return;
    }
    setMenuOpen(false);
  };

  return (
    <header className={`landing__nav ${scrolled ? 'landing__nav--scrolled' : ''}`}>
      <div className="landing__nav-inner">
        <Link to="/" className="landing__brand" aria-label="LNB PRO — Inicio">
          <span className="landing__brand-badge" aria-hidden="true">
            <span className="material-symbols-outlined" aria-hidden="true">
              sports_baseball
            </span>
          </span>
          <span className="landing__brand-text">
            <strong>
              LNB <em className="landing__brand-accent">PRO</em>
            </strong>
            <em>Liga Nacional de Béisbol</em>
          </span>
        </Link>

        <nav className="landing__nav-links" aria-label="Navegación principal">
          {NAV.map((l) => (
            <a
              key={l.to}
              href={l.to}
              onClick={(e) => handleNavClick(e, l)}
              className="landing__nav-link"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="landing__nav-actions">
          <button
            type="button"
            className="landing__icon-btn"
            aria-label="Cambiar tema"
            title="Cambiar tema"
            onClick={toggleTheme}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {isLogged ? (
            <>
              <Link
                to="/"
                className="landing__icon-btn"
                aria-label="Notificaciones"
                title="Notificaciones"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  notifications
                </span>
              </Link>

              <div className="landing__usermenu">
                <button
                  type="button"
                  className="landing__userchip"
                  onClick={() => setUserOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={userOpen}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    person
                  </span>
                  <span>{userName || 'Usuario'}</span>
                </button>

                {userOpen && (
                  <div className="landing__dropdown">
                    <span className="landing__dropdown-role">{role}</span>
                    <button
                      type="button"
                      className="landing__dropdown-btn"
                      onClick={() => {
                        setUserOpen(false);
                        onLogout?.();
                      }}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        logout
                      </span>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className="landing__btn landing__btn--ghost"
                onClick={onModalOpen}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                className="landing__btn landing__btn--solid"
                onClick={onRegisterOpen}
              >
                Crear Cuenta
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="landing__hamb"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            menu
          </span>
        </button>
      </div>

      {menuOpen && (
        <nav className="landing__nav-mobile" aria-label="Menú móvil">
          {NAV.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className="landing__nav-link"
              onClick={(e) => handleNavClick(e, l)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_forward_ios
              </span>
              {l.label}
            </a>
          ))}
          {!isLogged && (
            <button
              type="button"
              className="landing__btn landing__btn--solid"
              onClick={() => {
                setMenuOpen(false);
                onModalOpen?.();
              }}
            >
              Iniciar Sesión
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

export default LandingHeader;
