import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  Trophy,
  CalendarRange,
  BarChart3,
  Target,
} from 'lucide-react';
import { apiGet } from '../api';
import StatCard from './ui/StatCard';
import ParticleField from './ui/Particles';
import TextGenerateEffect from './ui/TextGenerateEffect';
import './dashboard.css';

function MainPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiGet('/teams/'),
      apiGet('/baseball-players/'),
      apiGet('/games/'),
      apiGet('/seasons/'),
      apiGet('/scores/'),
    ])
      .then(([teams, players, games, seasons, scores]) => {
        if (!active) return;
        const totalPoints = scores.reduce(
          (acc, s) => acc + (Number(s.w_points) || 0) + (Number(s.l_points) || 0),
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
      })
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
        accent: true,
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

  return (
    <div className="base-page dashboard">
      <section className="dashboard__hero dashboard__hero--fx">
        <ParticleField className="dashboard__particles" quantity={36} />
        <motion.div
          className="dashboard__hero-inner"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="dashboard__title">
            <TextGenerateEffect
              words="Bienvenido a la Plataforma de Gestión de Campeonatos de Béisbol"
              delay={0.1}
            />
          </h1>
          <p className="dashboard__subtitle">
            Datos, estadísticas y gestión en tiempo real de tus ligas y equipos
            favoritos. Todo en un solo lugar.
          </p>
        </motion.div>
      </section>

      <section className="dashboard__grid">
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
    </div>
  );
}

export default MainPage;
