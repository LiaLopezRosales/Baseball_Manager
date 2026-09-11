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
import TextGenerateEffect from './ui/TextGenerateEffect';
import FavoritesPanel, { FavoriteButton } from './FavoritesPanel';
import UserDashboard from './UserDashboard';
import './landing.css';

const REPORT_URL = (id) => `/api/queries/reports/?report_id=${id}`;

function Landing() {
  const [stats, setStats] = useState(null);
  const [standings, setStandings] = useState([]);
  const [batters, setBatters] = useState([]);
  const [stars, setStars] = useState([]);
  const [champions, setChampions] = useState([]);
  const [teamIdByName, setTeamIdByName] = useState({});
  const [playerIdByName, setPlayerIdByName] = useState({});
  const [error, setError] = useState(null);

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
          teams,
          players,
          persons,
          games,
          seasons,
          scores,
          standingsData,
          battersData,
          starsData,
          championsData,
        ]) => {
          if (!active) return;
          const totalPoints = scores.reduce(
            (acc, s) =>
              acc + (Number(s.w_points) || 0) + (Number(s.l_points) || 0),
            0
          );
          setStats({
            teams: teams.length,
            players: players.length,
            games: games.length,
            seasons: seasons.length,
            seggames: scores.length,
            avgPoints: games.length ? totalPoints / scores.length : 0,
            lastSeason: seasons[seasons.length - 1]?.name || '—',
          });
          setStandings(standingsData || []);
          setBatters((battersData || []).slice(0, 5));
          setStars((starsData || []).slice(0, 6));
          setChampions(championsData || []);

          const teamMap = {};
          (teams || []).forEach((t) => {
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
            if (per) playerMap[`${per.name} ${per.lastname}`.toLowerCase()] = pl.id;
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
        key: 'games',
        icon: Trophy,
        label: 'Juegos',
        sublabel: 'celebrados',
        value: stats.games,
        delay: 0.18,
      },
      {
        key: 'scores',
        icon: BarChart3,
        label: 'Puntuaciones',
        sublabel: 'registradas',
        value: stats.seggames,
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
    () => [...standings].sort((a, b) => (b['Total de puntos en juegos ganados'] || 0) - (a['Total de puntos en juegos ganados'] || 0)),
    [standings]
  );

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard__error">
          <p>No se pudieron cargar las estadísticas.</p>
          <p className="muted">{error.message}</p>
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

  return (
    <div className="landing">
      {/* HERO */}
      <section className="landing__hero">
        <ParticleField className="landing__particles" quantity={36} />
        <motion.div
          className="landing__hero-inner"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="landing__eyebrow">Liga Nacional de Béisbol</span>
          <h1 className="landing__title">
            <TextGenerateEffect
              words="Bienvenido a la Plataforma de Gestión de Campeonatos de Béisbol"
              delay={0.1}
            />
          </h1>
          <p className="landing__subtitle">
            Datos, estadísticas y gestión en tiempo real de tus ligas y equipos
            favoritos. Todo en un solo lugar.
          </p>
        </motion.div>
      </section>

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
          'Ganadores y puntos por equipo'
        )}
        <div className="landing__standings">
          {sortedStandings.length > 0 && (
            <BarChart
              teams={sortedStandings.map((r) => r.Equipo)}
              values={sortedStandings.map((r) => r['Total de puntos en juegos ganados'])}
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedStandings.map((row, i) => {
                const teamId = teamIdByName[row.Equipo];
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
              const pid = playerIdByName[
                `${b.Nombre} ${b.Apellido}`.toLowerCase()
              ];
              const nameNode = pid ? (
                <Link to={`/jugador/${pid}`} className="landing__leader-name landing__link">
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
            'Efectividad destacada por serie'
          )}
          <div className="landing__stars">
            {stars.map((s, i) => {
              const pid = playerIdByName[
                `${s.Nombre} ${s.Apellido}`.toLowerCase()
              ];
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
              <span className="landing__champ-dt">
                {c['Director Técnico']}
              </span>
              <span className="landing__champ-serie">{c.Serie}</span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Landing;
