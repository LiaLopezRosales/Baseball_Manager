import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  Trophy,
  CalendarRange,
  BarChart3,
  Target,
  Crown,
  Star,
  TrendingUp,
  Award,
} from 'lucide-react';
import { apiGet } from '../api';
import StatCard from './ui/StatCard';
import BarChart from './ui/BarChart';
import ParticleField from './ui/Particles';
import FavoritesPanel, { FavoriteButton } from './FavoritesPanel';
import UserDashboard from './UserDashboard';
import LandingHeader from './landing/LandingHeader';
import LandingHero from './landing/LandingHero';
import { getInitialTheme, applyTheme } from '../theme';
import './landing.css';

const REPORT_URL = (id) => `/api/queries/reports/?report_id=${id}`;

/* Deriva récord, PCT y DIF reales por equipo a partir de los Scores
   (winner/loser son FK a Team; w_points/l_points reales). */
function buildStandingsFromScores(scores, teams) {
  const byId = {};
  (teams || []).forEach((t) => {
    byId[t.id] = { id: t.id, name: t.name, initials: t.initials, w: 0, l: 0, pf: 0, pc: 0 };
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

  const rows = Object.values(byId).map((t) => {
    const total = t.w + t.l;
    const pct = total ? t.w / total : 0;
    const dif = (t.pf - t.pc) || 0;
    return {
      ...t,
      pct,
      pctStr: pct.toFixed(3).replace(/^0/, ''),
      dif: dif > 0 ? `+${dif}` : String(dif),
      jg: t.w,
      jp: t.l,
    };
  });

  return rows.sort((a, b) => b.w - a.w || b.pct - a.pct || b.dif - a.dif);
}

/* ÚltimoscCoreces: racha W/L simple para el líder. */
function streakFor(teamId, scores) {
  const seq = (scores || [])
    .filter((s) => s.winner === teamId || s.loser === teamId)
    .map((s) => (s.winner === teamId ? 'W' : 'L'));
  let cnt = 0;
  const last = seq[seq.length - 1];
  if (!last) return '—';
  for (let i = seq.length - 1; i >= 0; i -= 1) {
    if (seq[i] === last) cnt += 1;
    else break;
  }
  return `${cnt}${last === 'W' ? 'G' : 'P'}`;
}

function Landing({ isLogged = false, role = '', onModalOpen, onLogout }) {
  const [stats, setStats] = useState(null);
  const [standingsReport, setStandingsReport] = useState([]);
  const [batters, setBatters] = useState([]);
  const [stars, setStars] = useState([]);
  const [champions, setChampions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState([]);
  const [games, setGames] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [teamIdByName, setTeamIdByName] = useState({});
  const [playerIdByName, setPlayerIdByName] = useState({});
  const [error, setError] = useState(null);
  const [theme, setThemeState] = useState(() => getInitialTheme());

  useEffect(() => {
    let active = true;

    Promise.all([
      apiGet('/teams/'),
      apiGet('/baseball-players/'),
      apiGet('/persons/'),
      apiGet('/games/'),
      apiGet('/seasons/'),
      apiGet('/scores/'),
      apiGet(REPORT_URL(6)), // estadísticas por equipo (standings)
      apiGet(REPORT_URL(5)), // average de bateo (líderes)
      apiGet(REPORT_URL(1)), // jugadores estrella
      apiGet(REPORT_URL(0)), // campeones por temporada
    ])
      .then(
        ([
          teamsData,
          players,
          persons,
          gamesData,
          seasonsData,
          scoresData,
          standingsData,
          battersData,
          starsData,
          championsData,
        ]) => {
          if (!active) return;
          const totalPoints = (scoresData || []).reduce(
            (acc, s) =>
              acc + (Number(s.w_points) || 0) + (Number(s.l_points) || 0),
            0
          );
          setStats({
            teams: teamsData.length,
            players: players.length,
            games: gamesData.length,
            played: (scoresData || []).length,
            seasons: seasonsData.length,
            avgPoints: scoresData.length
              ? totalPoints / scoresData.length
              : 0,
            lastSeason: seasonsData[seasonsData.length - 1]?.name || '—',
          });
          setStandingsReport(standingsData || []);
          setBatters((battersData || []).slice(0, 5));
          setStars((starsData || []).slice(0, 6));
          setChampions(championsData || []);
          setTeams(teamsData || []);
          setScores(scoresData || []);
          setGames(gamesData || []);
          setSeasons(seasonsData || []);

          const teamMap = {};
          (teamsData || []).forEach((t) => {
            teamMap[t.name] = t.id;
          });
          setTeamIdByName(teamMap);

          const personById = {};
          (persons || []).forEach((p) => {
            personById[p.id] = p;
          });
          const playerMap = {};
          (players || []).forEach((pl) => {
            const per = personById[pl.P_id];
            if (per)
              playerMap[`${per.name} ${per.lastname}`.toLowerCase()] = pl.id;
          });
          setPlayerIdByName(playerMap);
        }
      )
      .catch((err) => {
        if (active) setError(err);
      });

    return () => {
      active = false;
    };
  }, []);

  const toggleTheme = () => {
    setThemeState((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  };

  /* Standings con datos de reporte 6 (puntos) + récord derivado real. */
  const standings = useMemo(() => {
    const byName = {};
    buildStandingsFromScores(scores, teams).forEach((r) => {
      byName[r.name] = r;
    });
    return (standingsReport || []).map((row) => ({
      ...row,
      ...(byName[row.Equipo] || {}),
    }));
  }, [standingsReport, scores, teams]);

  const leader = standings[0] || null;
  const totalPlayed = scores.length;
  const seriesTotal = games.length;

  const cards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        key: 'teams',
        icon: Shield,
        label: 'Equipos',
        sublabel: 'participantes',
        value: stats.teams,
        delay: 0.05,
      },
      {
        key: 'players',
        icon: Users,
        label: 'Jugadores',
        sublabel: 'registrados',
        value: stats.players,
        delay: 0.12,
      },
      {
        key: 'played',
        icon: Trophy,
        label: 'Juegos',
        sublabel: 'disputados',
        value: stats.played,
        delay: 0.18,
      },
      {
        key: 'scores',
        icon: BarChart3,
        label: 'Puntuaciones',
        sublabel: 'registradas',
        value: stats.played,
        delay: 0.24,
      },
      {
        key: 'seasons',
        icon: CalendarRange,
        label: 'Temporadas',
        sublabel: stats.lastSeason,
        value: stats.seasons,
        delay: 0.3,
      },
      {
        key: 'avg',
        icon: Target,
        label: 'Promedio pts/juego',
        sublabel: 'rendimiento',
        value: stats.avgPoints,
        decimals: 1,
        delay: 0.36,
      },
    ];
  }, [stats]);

  const sortedStandings = useMemo(
    () =>
      [...standings].sort(
        (a, b) =>
          Number(b['Total de puntos en juegos ganados'] || 0) -
          Number(a['Total de puntos en juegos ganados'] || 0)
      ),
    [standings]
  );

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

  const sectionTitle = (icon, title, sub) => (
    <div className="landing__section-head">
      <span className="landing__section-icon">{icon}</span>
      <div>
        <h2 className="landing__section-title">{title}</h2>
        {sub && <p className="landing__section-sub">{sub}</p>}
      </div>
    </div>
  );

  const renderChampTeam = (name) => {
    const teamId = teamIdByName[name];
    return teamId ? (
      <Link to={`/equipo/${teamId}`} className="landing__champ-team landing__link">
        {name}
      </Link>
    ) : (
      <span className="landing__champ-team">{name}</span>
    );
  };

  const lastSeasonName = seasons[seasons.length - 1]?.name || 'Temporada actual';

  return (
    <div className="landing" data-theme={theme}>
      <LandingHeader
        isLogged={isLogged}
        role={role}
        userName={typeof localStorage !== 'undefined' ? localStorage.getItem('userName') || '' : ''}
        theme={theme}
        onThemeChange={toggleTheme}
        onModalOpen={onModalOpen}
        onLogout={onLogout}
      />

      <LandingHero
        serieId="current"
        label={lastSeasonName}
        roundLabel="Temporada actual"
        standing={leader ? [leader] : []}
        standings={standings}
        isLogged={isLogged}
        onModalOpen={onModalOpen}
        totalPlayed={totalPlayed}
        seriesTotal={seriesTotal}
      />

      {/* STATS */}
      <section className="landing__grid">
        {stats
          ? cards.map((c) => (
              <StatCard
                key={c.key}
                icon={c.icon}
                label={c.label}
                sublabel={c.sublabel}
                value={c.value}
                decimals={c.decimals || 0}
                delay={c.delay}
                accent={c.accent}
              />
            ))
          : Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="stat-card stat-card--skeleton" />
            ))}
      </section>

      {/* DASHBOARD PERSONAL (solo usuarios logueados) */}
      {localStorage.getItem('token') && (
        <UserDashboard standings={standings} stars={stars} teamIdByName={teamIdByName} />
      )}

      {/* STANDINGS */}
      <section className="landing__section">
        {sectionTitle(
          <Trophy size={20} />,
          'Tabla de posiciones',
          'Ganadores, puntos y diferencial por equipo'
        )}
        <div className="landing__standings">
          {sortedStandings.length > 0 && (
            <BarChart
              teams={sortedStandings.map((r) => r.Equipo)}
              values={sortedStandings.map(
                (r) => r['Total de puntos en juegos ganados']
              )}
              title="Puntos ganados por equipo"
            />
          )}
          <table className="landing__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Equipo</th>
                <th>Juegos</th>
                <th>Pts ganados</th>
                <th>Pts perdidos</th>
                <th>Récord</th>
                <th>DIF</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedStandings.map((row, i) => {
                const teamId = teamIdByName[row.Equipo];
                const rec = row.w != null ? `${row.w}–${row.l}` : '—';
                return (
                  <tr key={row.Equipo}>
                    <td>{i + 1}</td>
                    <td className="landing__team">
                      {i === 0 && (
                        <Crown size={14} className="landing__crown" />
                      )}
                      {teamId ? (
                        <Link to={`/equipo/${teamId}`} className="landing__team-link">
                          {row.Equipo}
                        </Link>
                      ) : (
                        row.Equipo
                      )}
                    </td>
                    <td>{row['Total de juegos']}</td>
                    <td>{row['Total de puntos en juegos ganados']}</td>
                    <td>{row['Total de puntos en juegos perdidos']}</td>
                    <td>{rec}</td>
                    <td>{row.dif != null ? row.dif : '—'}</td>
                    <td className="landing__fav-cell">
                      {teamId && <FavoriteButton type="team" id={teamId} size={18} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* TUS FAVORITOS */}
      <FavoritesPanel />

      {/* LÍDERES + ESTRELLAS */}
      <div className="landing__two-col">
        <section className="landing__section">
          {sectionTitle(
            <TrendingUp size={20} />,
            'Líderes de bateo',
            'Mejor promedio de bateo'
          )}
          <ol className="landing__leaders">
            {batters.map((b, i) => {
              const pid =
                playerIdByName[`${b.Nombre} ${b.Apellido}`.toLowerCase()];
              const nameNode = pid ? (
                <Link
                  to={`/jugador/${pid}`}
                  className="landing__leader-name landing__link"
                >
                  {b.Nombre} {b.Apellido}
                </Link>
              ) : (
                <span className="landing__leader-name">
                  {b.Nombre} {b.Apellido}
                </span>
              );
              return (
                <li
                  key={`${b.Nombre}-${b.Apellido}`}
                  className="landing__leader"
                >
                  <span className="landing__leader-rank">
                    {['🥇', '🥈', '🥉'][i] || `${i + 1}°`}
                  </span>
                  {nameNode}
                  {pid && <FavoriteButton type="player" id={pid} size={16} />}
                  <span className="landing__leader-val">
                    {Number(b['Promedio de Bateo'] || b.Average || 0).toFixed(3)}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="landing__section">
          {sectionTitle(
            <Star size={20} />,
            'Jugadores estrella',
            'Efectividad destacada'
          )}
          <div className="landing__stars">
            {stars.map((s, i) => {
              const pid =
                playerIdByName[`${s.Nombre} ${s.Apellido}`.toLowerCase()];
              return (
                <div key={i} className="landing__star">
                  {pid ? (
                    <Link
                      to={`/jugador/${pid}`}
                      className="landing__star-name landing__link"
                    >
                      {s.Nombre} {s.Apellido}
                    </Link>
                  ) : (
                    <span className="landing__star-name">
                      {s.Nombre} {s.Apellido}
                    </span>
                  )}
                  {pid && <FavoriteButton type="player" id={pid} size={16} />}
                  <span className="landing__star-pos">{s.Posición}</span>
                  <span className="landing__star-val">
                    {Number(s.Efectividad).toFixed(3)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* CAMPEONES TIMELINE */}
      <section className="landing__section">
        {sectionTitle(
          <Award size={20} />,
          'Campeones por temporada',
          'Ganadores y directores técnicos'
        )}
        <div className="landing__timeline">
          {champions.map((c, i) => (
            <motion.div
              key={i}
              className="landing__champ"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="landing__champ-season">{c.Temporada}</span>
              {renderChampTeam(c.Equipo)}
              <span className="landing__champ-dt">{c['Director Técnico']}</span>
              <span className="landing__champ-serie">{c.Serie}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <span className="landing__footer-brand">Liga Nacional de Béisbol</span>
          <span>{stats ? `${stats.teams} equipos · ${stats.played} juegos disputados · ${stats.seasons} temporadas` : 'Cargando…'}</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;