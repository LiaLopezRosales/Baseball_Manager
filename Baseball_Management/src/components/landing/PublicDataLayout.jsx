import { useState } from 'react';
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import LandingHeader from './LandingHeader';
import { QUERY_TABLES } from '../../routes';
import { QueryRoute } from '../../viewRoutes';
import { getInitialTheme } from '../../theme';
import './PublicDataLayout.css';

// Chrome público para páginas de datos (consultas): barra superior igual
// al hero de la landing + sidebar "PANEL DE CONSULTAS". Solo para invitados;
// los usuarios con cuenta siguen viendo el shell completo de la app.
function PublicDataLayout({ onModalOpen, onRegisterOpen, onLogout }) {
  const [theme, setTheme] = useState(() => getInitialTheme());
  const location = useLocation();
  const navigate = useNavigate();

  const match = location.pathname.match(/^\/consultas\/([^/]+)/);
  const current = match ? decodeURIComponent(match[1]) : null;

  return (
    <div className="landing data-layout" data-theme={theme}>
      <LandingHeader
        isLogged={false}
        userName=""
        role=""
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
        <aside className="data-layout__side" aria-label="Panel de consultas">
          <div className="data-layout__side-top">
            <span className="data-layout__side-label">Sección</span>
            <h2 className="data-layout__side-title">Panel de Consultas</h2>
            <p className="data-layout__side-sub">
              Padrones oficiales de la liga, consultables en tiempo real.
            </p>
          </div>
          <nav className="data-layout__side-nav">
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
            Datos verificados por la Dirección de Estadística
          </div>
        </aside>

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
      </div>

      <footer className="data-layout__footer">
        <div className="data-layout__footer-left">
          <span className="data-layout__footer-brand">
            LNB <em>PRO</em>
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
      </footer>
    </div>
  );
}

export default PublicDataLayout;