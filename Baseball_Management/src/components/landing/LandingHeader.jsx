import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  LogOut,
  UserRound,
  ChevronRight,
} from 'lucide-react';
import { applyTheme } from '../../theme';

function LandingHeader({
  isLogged,
  userName,
  role,
  onModalOpen,
  onLogout,
  theme,
  onThemeChange,
  onNameChange,
}) {
  const [isScrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#formato', label: 'Formato' },
    { href: '#posiciones', label: 'Posiciones' },
    { href: '#lideres', label: 'Líderes' },
    { href: '#estrellas', label: 'Estrellas' },
    { href: '#campeones', label: 'Campeones' },
  ];

  const handleThemeKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onThemeChange();
    }
  };

  return (
    <header
      className={`landing__nav ${isScrolled ? 'landing__nav--scrolled' : ''}`}
    >
      <div className="landing__nav-inner">
        <Link to="/" className="landing__brand" aria-label="Liga Nacional de Béisbol — inicio">
          <span className="landing__brand-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12 L6 12 L8 20 L16 20 L18 12 L21 12" />
              <path d="M12 3 L12 9 M9 6 L15 6" />
            </svg>
          </span>
          <span className="landing__brand-text">
            <strong>Liga Nacional</strong>
            <em>de Béisbol</em>
          </span>
        </Link>

        <nav className="landing__nav-links" aria-label="Navegación principal">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="landing__nav-link">
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
            onClick={onThemeChange}
            onKeyDown={handleThemeKey}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isLogged ? (
            <>
              <button
                type="button"
                className="landing__icon-btn"
                aria-label="Notificaciones"
                title="Notificaciones"
              >
                <Bell size={18} />
              </button>

              <div className="landing__usermenu">
                <button
                  type="button"
                  className="landing__userchip"
                  onClick={() => setIsUserOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={isUserOpen}
                >
                  <UserRound size={16} />
                  <span>{userName || 'Usuario'}</span>
                </button>

                {isUserOpen && (
                  <div className="landing__dropdown">
                    <span className="landing__dropdown-role">{role}</span>
                    <button
                      type="button"
                      className="landing__dropdown-btn"
                      onClick={onLogout}
                    >
                      <LogOut size={15} /> Cerrar sesión
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
                Iniciar sesión
              </button>
              <Link to="/registro" className="landing__btn landing__btn--solid">
                Crear cuenta
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="landing__hamb"
          aria-label="Abrir menú"
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen((o) => !o)}
        >
          <Menu size={20} />
        </button>
      </div>

      {isMobileOpen && (
        <nav className="landing__nav-mobile" aria-label="Menú móvil">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="landing__nav-link" onClick={() => setIsMobileOpen(false)}>
              <ChevronRight size={14} /> {l.label}
            </a>
          ))}
          {!isLogged && (
            <button
              type="button"
              className="landing__btn landing__btn--solid"
              onClick={onModalOpen}
            >
              Iniciar sesión
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

export default LandingHeader;
