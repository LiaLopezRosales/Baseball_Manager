import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiGet } from '../api';
import FavoritesPanel from './FavoritesPanel';
import LandingHeader from './landing/LandingHeader';
import LandingHero from './landing/LandingHero';
import { getInitialTheme, applyTheme } from '../theme';
import './landing.css';

const REPORT_URL = (id) => `/api/queries/reports/?report_id=${id}`;

/* ─── helpers de datos ─────────────────────────────────────────────────────── */

function buildStandingsFromScores(scores, teams) {
  const byId = {};
  (teams || []).forEach((t) => {
    byId[t.id] = {
      id: t.id,
      name: t.name,
      initials: t.initials,
      w: 0,
      l: 0,
      pf: 0,
      pc: 0,
    };
  });

  /* Indexar scores por teamId (para last10) */
  const scoresByTeam = {};
  (scores || []).forEach((s) => {
    const wid = s.winner;
    const lid = s.loser;
    if (wid && !scoresByTeam[wid]) scoresByTeam[wid] = [];
    if (lid && !scoresByTeam[lid]) scoresByTeam[lid] = [];
    if (wid) scoresByTeam[wid].push({ id: s.id, win: true });
    if (lid) scoresByTeam[lid].push({ id: s.id, win: false });
  });

  (scores || []).forEach((s) => {
    const w = byId[s.winner];
    const l = byId[s.loser];
    if (w) {
      w.w += 1;
      w.pf += Number(s.w_points) || 0;
      w.pc += Number(s.l_points) || 0;
    }
    if (l) {
      l.l += 1;
      l.pf += Number(s.l_points) || 0;
      l.pc += Number(s.w_points) || 0;
    }
  });

  return Object.values(byId)
    .map((t) => {
      const total = t.w + t.l;
      const pct = total ? t.w / total : 0;
      const dif = t.pf - t.pc || 0;

      /* last10: últimos 10 juegos ordenados por id (cronológico) */
      const hist = (scoresByTeam[t.id] || []).sort((a, b) => a.id - b.id);
      const last10Slice = hist.slice(-10);
      const last10W = last10Slice.filter((s) => s.win).length;
      const last10L = last10Slice.length - last10W;
      const last10 = hist.length ? `${last10W}–${last10L}` : '—';

      return {
        ...t,
        pct,
        pctStr: pct.toFixed(3).replace(/^0/, ''),
        dif: dif > 0 ? `+${dif}` : String(dif),
        jg: t.w,
        jp: t.l,
        runsFor: t.pf,
        runsAgainst: t.pc,
        last10,
      };
    })
    .sort((a, b) => b.w - a.w || b.pct - a.pct || b.dif - a.dif);
}

/* Racha W/L para el líder. */
function streakFor(teamId, scores) {
  const seq = (scores || [])
    .filter((s) => s.winner === teamId || s.loser === teamId)
    .sort((a, b) => (a.id || 0) - (b.id || 0))
    .map((s) => (s.winner === teamId ? 'W' : 'L'));
  let cnt = 0;
  const last = seq[seq.length - 1];
  if (!last) return '—';
  for (let i = seq.length - 1; i >= 0; i -= 1) {
    if (seq[i] === last) cnt += 1;
    else break;
  }
  return `${last}${cnt}`;
}

/* Cadena DT: direction-team → technical-directors → workers → persons. */
function buildDTChain(directionTeams, technicalDirectors, workers, persons) {
  const personsById = {};
  (persons || []).forEach((p) => { personsById[p.id] = p; });
  const workersById = {};
  (workers || []).forEach((w) => { workersById[w.id] = w; });
  const tdirsByDtId = {};
  (technicalDirectors || []).forEach((td) => {
    tdirsByDtId[td.direction_team] = td;
  });

  return (teamId) => {
    const dtm = (directionTeams || []).find((d) => Number(d.Team_id) === Number(teamId));
    if (!dtm) return null;
    const tdir = tdirsByDtId[dtm.id];
    if (!tdir) return null;
    const w = workersById[tdir.W_id];
    if (!w) return null;
    const p = personsById[w.P_id];
    if (!p) return null;
    return `${p.name} ${p.lastname}`.trim() || null;
  };
}

/* Última temporada de la lista de temporadas */
function lastSeasonNameFn(seasons) {
  return seasons[seasons.length - 1]?.name || '—';
}

/* ─── Componente ───────────────────────────────────────────────────────────── */

function Landing({ isLogged = false, role = '', onModalOpen, onLogout }) {
  const [standingsReport, setStandingsReport] = useState([]);
  const [batters, setBatters] = useState([]);
  const [champions, setChampions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [players, setPlayers] = useState([]);
  const [directionTeams, setDirectionTeams] = useState([]);
  const [technicalDirectors, setTechnicalDirectors] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [persons, setPersons] = useState([]);
  const [teamIdByName, setTeamIdByName] = useState({});
  const [error, setError] = useState(null);
  const [theme, setThemeState] = useState(() => getInitialTheme());

  useEffect(() => {
    let active = true;

    Promise.all([
      apiGet('/teams/'),
      apiGet('/baseball-players/'),
      apiGet('/persons/'),
      apiGet('/seasons/'),
      apiGet('/scores/'),
      apiGet(REPORT_URL(6)),
      apiGet(REPORT_URL(5)),
      apiGet(REPORT_URL(0)),
      apiGet('/direction-teams/'),
      apiGet('/technical-directors/'),
      apiGet('/workers/'),
    ])
      .then(
        ([
          teamsData,
          playersData,
          personsData,
          seasonsData,
          scoresData,
          standingsData,
          battersData,
          championsData,
          directionTeamsData,
          technicalDirectorsData,
          workersData,
        ]) => {
          if (!active) return;

          setTeams(teamsData || []);
          setScores(scoresData || []);
          setSeasons(seasonsData || []);
          setPlayers(playersData || []);
          setStandingsReport(standingsData || []);
          setBatters((battersData || []).slice(0, 5));
          setChampions(championsData || []);
          setDirectionTeams(directionTeamsData || []);
          setTechnicalDirectors(technicalDirectorsData || []);
          setWorkers(workersData || []);
          setPersons(personsData || []);

          const teamMap = {};
          (teamsData || []).forEach((t) => { teamMap[t.name] = t.id; });
          setTeamIdByName(teamMap);
        }
      )
      .catch((err) => {
        if (active) setError(err);
      });

    return () => { active = false; };
  }, []);

  const toggleTheme = () => {
    setThemeState((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  };

  /* ─── Datos derivados (useMemo) ─────────────────────────────────────────── */

  const standings = useMemo(() => {
    const byName = {};
    buildStandingsFromScores(scores, teams).forEach((r) => { byName[r.name] = r; });
    return (standingsReport || []).map((row) => ({
      ...row,
      ...(byName[row.Equipo] || {}),
    }));
  }, [standingsReport, scores, teams]);

  const leader = standings[0] || null;
  const totalPlayed = scores.length;
  const lastSeasonName = lastSeasonNameFn(seasons);

  /* Cadena DT (resuelta una vez que todo esté cargado) */
  const resolveDT = useMemo(
    () => buildDTChain(directionTeams, technicalDirectors, workers, persons),
    [directionTeams, technicalDirectors, workers, persons]
  );

  /* Líder enriquecido (con DT, streak, last10, runsFor/Against) */
  const leaderEnriched = useMemo(() => {
    if (!leader) return null;
    return {
      ...leader,
      dt: resolveDT(leader.id) || null,
      streak: streakFor(leader.id, scores),
    };
  }, [leader, resolveDT, scores]);

  /* Promedio liga: media de batting_average de todos los jugadores */
  const leagueAvg = useMemo(() => {
    const avgs = (players || [])
      .map((p) => Number(p.batting_average))
      .filter((v) => !isNaN(v) && v > 0);
    if (!avgs.length) return 0;
    return avgs.reduce((a, b) => a + b, 0) / avgs.length;
  }, [players]);

  /* Top bateo: mejor promedio del reporte 5 */
  const topBateo = useMemo(() => {
    if (!batters.length) return null;
    const best = batters[0];
    const avg = Number(best['Promedio de Bateo'] || best.Average || 0);
    return { promedio: avg, nombre: `${best.Nombre} ${best.Apellido}` };
  }, [batters]);

  /* Métricas para el hero */
  const heroMetrics = useMemo(
    () => ({
      topBateo,
      promedioLiga: leagueAvg,
      franquicias: teams.length,
    }),
    [topBateo, leagueAvg, teams]
  );

  /* Palmarés: campeones ordenados cronológicamente */
  const palmares = useMemo(() => {
    return [...champions].sort((a, b) => {
      if (a.Temporada < b.Temporada) return -1;
      if (a.Temporada > b.Temporada) return 1;
      return 0;
    });
  }, [champions]);

  /* ─── Error state ────────────────────────────────────────────────────────── */

  if (error) {
    return (
      <div className="landing">
        <LandingHeader
          isLogged={isLogged}
          role={role}
          theme={theme}
          onThemeChange={toggleTheme}
          onModalOpen={onModalOpen}
          onLogout={onLogout}
        />
        <div className="landing__section">
          <p>No se pudieron cargar las estadísticas de la liga.</p>
          <p className="landing__section-sub">{error.message}</p>
        </div>
      </div>
    );
  }

  /* ─── Render ─────────────────────────────────────────────────────────────── */

  return (
    <div className="landing" data-theme={theme}>
      <LandingHeader
        isLogged={isLogged}
        role={role}
        userName={
          typeof localStorage !== 'undefined'
            ? localStorage.getItem('userName') || ''
            : ''
        }
        theme={theme}
        onThemeChange={toggleTheme}
        onModalOpen={onModalOpen}
        onLogout={onLogout}
      />

      {/* HERO */}
      <LandingHero
        label={lastSeasonName}
        leader={leaderEnriched}
        totalPlayed={totalPlayed}
        metrics={heroMetrics}
        theme={theme}
      />

      {/* PALMARÉS + CALLOUT — fiel al mockup dark/light */}
      {palmares.length > 0 && (
        <section className="landing__palmares">
          <div className="landing__palmares-inner">
            <motion.div
              className="landing__palmares-head"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="landing__palmares-eyebrow">
                Palmarés y Glorias del Béisbol
              </span>
              <h2 className="landing__palmares-title">
                Campeones de las Últimas Temporadas
              </h2>
              <p className="landing__palmares-sub">
                Registro histórico de las Series Finales y sus directores
                técnicos laureados.
              </p>
            </motion.div>

            <div className="landing__palmares-grid">
              {palmares.map((c, i) => {
                const teamId = teamIdByName[c.Equipo];
                const year = c.Temporada || '—';
                const yearClass = [
                  'landing__palmares-year--rose',
                  'landing__palmares-year--amber',
                  'landing__palmares-year--muted',
                  'landing__palmares-year--muted',
                ][i] || 'landing__palmares-year--muted';
                return (
                  <motion.div
                    key={i}
                    className="landing__palmares-card"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className="landing__palmares-card-top">
                      <span className={`landing__palmares-year ${yearClass}`}>
                        {year}
                      </span>
                      <span className="landing__palmares-serie">{c.Serie}</span>
                    </div>
                    {teamId ? (
                      <Link
                        to={`/equipo/${teamId}`}
                        className="landing__palmares-team"
                      >
                        {c.Equipo}
                      </Link>
                    ) : (
                      <h4 className="landing__palmares-team">{c.Equipo}</h4>
                    )}
                    <p className="landing__palmares-dt">
                      DT: <span>{c['Director Técnico']}</span>
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Callout DT — banner CTA fiel */}
            <div className="landing__callout">
              <div className="landing__callout-left">
                <div className="landing__callout-ico" aria-hidden="true">
                  <span className="material-symbols-outlined">sports</span>
                </div>
                <div>
                  <h3 className="landing__callout-title">
                    ¿Eres Director Técnico (DT) o Anotador Oficial?
                  </h3>
                  <p className="landing__callout-sub">
                    Accede a la plataforma de gestión táctica: cambio de
                    rosters en tiempo real, validación de lineup card 45
                    minutos antes del playball y descarga de reportes oficiales
                    WBSC.
                  </p>
                </div>
              </div>
              <div className="landing__callout-actions">
                <Link to="/dt/cambios" className="landing__callout-btn ghost">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    badge
                  </span>
                  Portal DT / Cambios
                </Link>
                <Link to={isLogged && role === 'Admin' ? '/admin/posiciones' : '/registro'} className="landing__callout-btn solid">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    admin_panel_settings
                  </span>
                  Gestión de Liga (Admin)
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAVORITOS (solo logueados) */}
      {isLogged && <FavoritesPanel />}

      {/* FOOTER 5-COLUMNAS — fiel al mockup (bg #081626) */}
      <footer className="landing__footer">
        <div className="landing__footer-top">
          <div className="landing__footer-brand-col">
            <span className="landing__footer-name">
              Liga Nacional de Béisbol
            </span>
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
                <Link to="/consultas/Game">Cuadro de Play-Offs</Link>
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
                <Link to="/reporte/jugadores-estrellas">Altas y Bajas Semanales</Link>
              </li>
              <li>
                <Link to="/reporte/carreras-limpias-juegos-ganados">
                  Reglamento de Campeonato 2025
                </Link>
              </li>
              <li>
                <Link to="/reporte/efectividad-por-posicion">
                  Protocolo Antidopaje
                </Link>
              </li>
              <li>
                <Link to="/reporte/jugadores-de-un-equipo">
                  API Pública de Estadísticas
                </Link>
              </li>
            </ul>
          </div>

          <div className="landing__footer-col">
            <h4>Portales Técnicos</h4>
            <ul>
              <li>
                <Link to="/dt/cambios">Portal Directores Técnicos (DT)</Link>
              </li>
              <li>
                <Link to="/dt/listar-cambios">Mesa de Control y Anotadores</Link>
              </li>
              <li>
                <Link to="/consultas/Team">Comisión de Arbitraje</Link>
              </li>
              <li>
                <Link to="/consultas/Worker">Sala de Prensa y Acreditaciones</Link>
              </li>
              <li>
                <Link to="/registro">Federación Deportiva Nacional</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="landing__footer-bottom">
          <span className="landing__footer-copy">
            © 2025-2026 Liga Nacional de Béisbol. Todos los derechos reservados.
          </span>
          <div className="landing__footer-legal">
            <a href="/registro" className="landing__footer-legal-link">Términos de Uso</a>
            <a href="/registro" className="landing__footer-legal-link">Política de Privacidad</a>
            <a href="/registro" className="landing__footer-legal-link">Auditoría de Datos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
