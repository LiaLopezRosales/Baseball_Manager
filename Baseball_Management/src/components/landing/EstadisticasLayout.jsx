import { useState } from 'react';
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import LandingHeader from './LandingHeader';
import { REPORT_ROUTES } from '../../routes';
import { ReportRoute } from '../../viewRoutes';
import { getInitialTheme } from '../../theme';
import './EstadisticasLayout.css';

// Chrome de páginas de estadísticas (/reporte/:slug) para TODOS los roles:
// barra superior del hero (LandingHeader) + sidebar rail real "MÓDULO DE
// ESTADÍSTICAS" (NO scrolleable) + footer WBSC anclado abajo. SOLO la zona
// central (.data-layout__main) scrollea. Referencia visual: wireframe LNB
// "Estadísticas" (oscura/clara).
function EstadisticasLayout({
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

  const match = location.pathname.match(/^\/reporte\/([^/]+)/);
  const current = match ? decodeURIComponent(match[1]) : null;
  const reportSlugs = Object.keys(REPORT_ROUTES);

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
          <p>Selecciona un reporte desde el panel de estadísticas.</p>
          <Link className="qry__row-link" to="/reporte/equipos-ganadores">
            Ir a Equipos Ganadores
          </Link>
        </div>
      )}

      <div className="data-layout__body">
        <aside
          className="data-layout__side data-layout__side--stats"
          aria-label="Módulo de estadísticas"
        >
          <div className="data-layout__side-head">
            <span className="data-layout__side-label">Módulo de Estadísticas</span>
            <span className="data-layout__side-dot" aria-hidden="true" />
          </div>
          <h2 className="data-layout__side-title">Registros LNB</h2>

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

            {reportSlugs.map((slug) => {
              const rep = REPORT_ROUTES[slug];
              const active = current === slug;
              return (
                <Link
                  key={slug}
                  to={`/reporte/${slug}`}
                  className={`data-layout__side-item${
                    active ? ' data-layout__side-item--active' : ''
                  }`}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {rep.icon}
                  </span>
                  <span>{rep.short}</span>
                </Link>
              );
            })}
          </nav>

          <div className="est-side-foot">
            <div className="est-side-foot__row">
              <strong className="est-side-foot__title">Temporada Regular</strong>
              <span className="est-side-foot__chip">Activa</span>
            </div>
            <span className="est-side-foot__ed">Edición Nacional 2024</span>
            <p className="est-side-foot__live">
              <span className="est-side-foot__pulse" aria-hidden="true" />
              Actualizado en tiempo real
            </p>
          </div>
        </aside>

        <div className="data-layout__content">
          <main className="data-layout__main">
            {/* Selector de reporte en anchos donde el sidebar se oculta */}
            <div className="data-layout__mobile-nav">
              <label
                htmlFor="data-layout__report-select"
                className="data-layout__side-label"
              >
                Reporte
              </label>
              <select
                id="data-layout__report-select"
                value={current || reportSlugs[0]}
                onChange={(e) => navigate(`/reporte/${e.target.value}`)}
              >
                {reportSlugs.map((slug) => (
                  <option key={slug} value={slug}>
                    {REPORT_ROUTES[slug].short}
                  </option>
                ))}
              </select>
            </div>

            <Routes>
              <Route path="/reporte/:slug" element={<ReportRoute />} />
            </Routes>
          </main>

          <footer className="data-layout__footer data-layout__footer--stats">
            <div className="est-footer">
              <div className="est-footer__left">
                <span className="material-symbols-outlined est-footer__verify" aria-hidden="true">
                  verified
                </span>
                <strong className="est-footer__affil">Afiliado Oficial WBSC</strong>
                <span className="est-footer__sep" aria-hidden="true">
                  •
                </span>
                <span className="est-footer__platform">
                  World Baseball Softball Confederation Sanctioned Platform
                </span>
              </div>
              <div className="est-footer__right">
                © {new Date().getFullYear()} LNB PRO Telemetry &amp; Analytics.
                Todos los derechos reservados.
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default EstadisticasLayout;