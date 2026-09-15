import { useState } from 'react';
import {
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import LandingHeader from './LandingHeader';
import { QUERY_TABLES } from '../../routes';
import { QueryRoute } from '../../viewRoutes';
import { getInitialTheme } from '../../theme';
import './ConsultasLayout.css';

// Chrome de páginas de consultas (/consultas/:tabla) para TODOS los roles:
// barra superior del hero (LandingHeader, sticky) + sidebar rail real
// "MÓDULO DE CONSULTAS". La zona de datos es fluida (full-width).
function ConsultasLayout({
  isLogged,
  userName,
  role,
  onModalOpen,
  onRegisterOpen,
  onLogout,
}) {
  const [theme, setTheme] = useState(() => getInitialTheme());
  const location = useLocation();
  const navigate = useNavigate();

  const match = location.pathname.match(/^\/consultas\/([^/]+)/);
  const current = match ? decodeURIComponent(match[1]) : null;

  // Deep-link a una tabla que ya no se ofrece en el padrón → redirigir a la primera.
  if (match && !QUERY_TABLES.some((t) => t.value === current)) {
    return <Navigate to={`/consultas/${QUERY_TABLES[0].value}`} replace />;
  }

  return (
    <div className="landing data-layout" data-theme={theme}>
      <LandingHeader
        isLogged={isLogged}
        userName={userName}
        role={role}
        onModalOpen={onModalOpen}
        onRegisterOpen={onRegisterOpen}
        onLogout={onLogout}
        theme={theme}
        onThemeChange={setTheme}
        onNameChange={() => {}}
      />

      {!match && (
        <div className="data-layout__bad_path">
          <p>Selecciona una tabla desde el panel de consultas.</p>
          <Link className="qry__row-link" to="/consultas/Series">
            Ir a Series
          </Link>
        </div>
      )}

      <div className="data-layout__body">
        <aside className="data-layout__side" aria-label="Módulo de consultas">
          <div className="data-layout__side-head">
            <span className="data-layout__side-label">Módulo de Consultas</span>
            <span className="data-layout__side-dot" aria-hidden="true" />
          </div>

          <nav className="data-layout__side-nav">
            <Link
              to="/"
              className="data-layout__side-item data-layout__side-item--home"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                home
              </span>
              <span>Inicio</span>
            </Link>

            {QUERY_TABLES.map((t) => (
              <Link
                key={t.value}
                to={`/consultas/${t.value}`}
                className={`data-layout__side-item${
                  current === t.value ? ' data-layout__side-item--active' : ''
                }`}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {current === t.value ? 'folder_open' : 'description'}
                </span>
                <span>{t.label}</span>
              </Link>
            ))}
          </nav>

          <div className="data-layout__side-foot">
            <span className="material-symbols-outlined" aria-hidden="true">
              verified
            </span>
            <span>
              <strong>LNB Data Desk</strong>
              Datos verificados por la Dirección de Estadística.
            </span>
          </div>
        </aside>

        <div className="data-layout__content">
        <main className="data-layout__main">
          {/* Selector de tabla en anchos donde el sidebar se oculta */}
          <div className="data-layout__mobile-nav">
            <label
              htmlFor="data-layout__table-select"
              className="data-layout__side-label"
            >
              Consulta
            </label>
            <select
              id="data-layout__table-select"
              value={current || QUERY_TABLES[0].value}
              onChange={(e) => navigate(`/consultas/${e.target.value}`)}
            >
              {QUERY_TABLES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <Routes>
            <Route
              path="/consultas/:tabla"
              element={<QueryRoute onRequireAuth={onModalOpen} />}
            />
          </Routes>
        </main>

<footer className="data-layout__footer">
          <div className="data-layout__footer-notice">
            <span className="material-symbols-outlined" aria-hidden="true">
              info
            </span>
            <p>
              <strong>Nota Reglamentaria.</strong> Los datos publicados provienen
              del sistema oficial de gestión de la liga y se actualizan con cada
              resultado registrado. Cualquier discrepancia debe reportarse al
              departamento de estadística.{' '}
              <em>Actualización: en tiempo real.</em>
            </p>
          </div>
          <div className="data-layout__footer-bottom">
            <div className="data-layout__footer-left">
              <span className="data-layout__footer-brand">
                LNB <em>PRO</em>
              </span>
              <span className="data-layout__footer-disclaimer">
                Padrón de datos públicos · LNBP — los perfiles y estadísticas
                individuales se verifican por serie y temporada vigente.
              </span>
              <span>
                © {new Date().getFullYear()} Liga Nacional de Béisbol. Todos los
                derechos reservados.
              </span>
            </div>
            <div className="data-layout__footer-right">
              <span title="Página en construcción">Privacidad</span>
              <span title="Página en construcción">Términos de Datos</span>
              <span title="Página en construcción">Contacto Técnico</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
  );
}

export default ConsultasLayout;