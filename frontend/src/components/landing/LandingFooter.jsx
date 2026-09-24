import { Link } from 'react-router-dom';

// Footer público 5-columnas — reutilizado por la landing y por las páginas
// informativas (InfoLayout). Los enlaces apuntan a páginas reales de la app.
function LandingFooter() {
  return (
    <footer className="landing__footer">
      <div className="landing__footer-top">
        <div className="landing__footer-brand-col">
          <span className="landing__footer-name">Liga Nacional de Béisbol</span>
          <p className="landing__footer-tagline">
            Órgano rector y circuito élite del béisbol profesional nacional.
            Plataforma de telemetría, asignaciones oficiales de rosters,
            boxscores en vivo y recopilación estadística certificada para la
            Serie Nacional 2025-2026.
          </p>
          <div className="landing__footer-badges">
            <span className="landing__footer-badge landing__footer-badge--gold">
              Homologación WBSC
            </span>
            <span className="landing__footer-badge landing__footer-badge--slate">
              Radar Statcast Sync
            </span>
          </div>
        </div>

        <div className="landing__footer-col">
          <h4>Competición</h4>
          <ul>
            <li>
              <Link to="/reporte/estadisticas-juegos-por-equipos">
                Tabla de Posiciones
              </Link>
            </li>
            <li>
              <Link to="/reporte/average">Líderes Ofensivos y Pitcheo</Link>
            </li>
            <li>
              <Link to="/consultas/Series">Calendario de Temporada</Link>
            </li>
            <li>
              <Link to="/comparar">Comparador de Peloteros</Link>
            </li>
            <li>
              <Link to="/playoffs">Cuadro de Play-Offs</Link>
            </li>
          </ul>
        </div>

        <div className="landing__footer-col">
          <h4>Reportes Oficiales</h4>
          <ul>
            <li>
              <Link to="/reporte/equipos-ganadores">
                Anotaciones Certificadas
              </Link>
            </li>
            <li>
              <Link to="/altas-bajas">Altas y Bajas Semanales</Link>
            </li>
            <li>
              <Link to="/reglamento">Reglamento de Campeonato 2025</Link>
            </li>
            <li>
              <Link to="/protocolo-antidopaje">Protocolo Antidopaje</Link>
            </li>
            <li>
              <Link to="/api-publica">API Pública de Estadísticas</Link>
            </li>
          </ul>
        </div>

        <div className="landing__footer-col">
          <h4>Portales Técnicos</h4>
          <ul>
            <li>
              <Link to="/dt/cambios">Portal Directores Técnicos</Link>
            </li>
            <li>
              <Link to="/dt/listar-cambios">Mesa de Control y Anotadores</Link>
            </li>
            <li>
              <Link to="/comision-arbitraje">Comisión de Arbitraje</Link>
            </li>
            <li>
              <Link to="/sala-prensa">Sala de Prensa y Acreditaciones</Link>
            </li>
            <li>
              <Link to="/federacion">Federación Deportiva Nacional</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="landing__footer-bottom">
        <span className="landing__footer-copy">
          © 2025-2026 Liga Nacional de Béisbol. Todos los derechos reservados.
        </span>
        <div className="landing__footer-legal">
          <Link to="/terminos" className="landing__footer-legal-link">
            Términos de Uso
          </Link>
          <Link to="/privacidad" className="landing__footer-legal-link">
            Política de Privacidad
          </Link>
          <Link to="/api-publica" className="landing__footer-legal-link">
            Auditoría de Datos
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
