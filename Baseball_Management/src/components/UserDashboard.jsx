import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, Heart, CalendarDays } from 'lucide-react';
import { apiGet } from '../api';
import RadarChart from './ui/RadarChart';
import './userDashboard.css';

function UserDashboard({ standings, stars, teamIdByName }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    apiGet('/api/user/dashboard/')
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) return null;
  if (!data) {
    return (
      <section className="dashboard-card dashboard-card--loading">
        Cargando tu dashboard…
      </section>
    );
  }

  const team = data.favorite_team;

  let position = null;
  if (team && standings.length) {
    const sorted = [...standings].sort(
      (a, b) => (b['Total de puntos en juegos ganados'] || 0) - (a['Total de puntos en juegos ganados'] || 0)
    );
    position = sorted.findIndex((r) => r.Equipo === team.name);
    if (position >= 0) position += 1;
  }

  const teamStars = team
    ? (stars || []).filter((s) => teamIdByName[team.name] !== undefined) 
    : [];

  const favPlayer = data.favorite_players && data.favorite_players[0];

  return (
    <section className="dashboard-card">
      <div className="dashboard-card__head">
        <Heart size={20} className="dashboard-card__icon" />
        <div>
          <h2 className="dashboard-card__title">Tu panel</h2>
          <p className="dashboard-card__sub">
            {team ? `Siguiendo a ${team.name}` : 'Elige tu equipo favorito con el corazón ♥'}
          </p>
        </div>
        {data.unread_notifications > 0 && (
          <span className="dashboard-card__badge">
            {data.unread_notifications}{' '}
            {data.unread_notifications === 1 ? 'notificación' : 'notificaciones'}
          </span>
        )}
      </div>

      {team ? (
        <div className="dashboard-card__grid">
          {/* Posición en standings */}
          <div className="dashboard-card__tile">
            <Trophy size={18} className="dashboard-card__tile-icon" />
            <span className="dashboard-card__tile-label">Posición actual</span>
            <span className="dashboard-card__tile-value">
              {position ? `${position}°` : '—'}
            </span>
          </div>

          {/* Últimos partidos */}
          <div className="dashboard-card__tile dashboard-card__tile--wide">
            <CalendarDays size={18} className="dashboard-card__tile-icon" />
            <span className="dashboard-card__tile-label">Últimos juegos</span>
            {data.recent_games && data.recent_games.length > 0 ? (
              <ul className="dashboard-card__games">
                {data.recent_games.slice(0, 4).map((g) => (
                  <li key={g.game_id} className="dashboard-card__game">
                    <span className="dashboard-card__game-date">{g.date}</span>
                    <span className="dashboard-card__game-rival">
                      vs {g.rival_initials}
                    </span>
                    <span className="dashboard-card__game-score">
                      {g.is_local ? (
                        <>
                          <strong>{g.local_score}</strong> – {g.rival_score}
                        </>
                      ) : (
                        <>
                          {g.local_score} – <strong>{g.rival_score}</strong>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="dashboard-card__tile-muted">Sin juegos aún</span>
            )}
          </div>

          {/* Jugador favorito con radar */}
          {favPlayer && (
            <div className="dashboard-card__tile dashboard-card__tile--chart">
              <Star size={18} className="dashboard-card__tile-icon" />
              <span className="dashboard-card__tile-label">
                <Link to={`/jugador/${favPlayer.id}`} className="dashboard-card__link">
                  {favPlayer.name}
                </Link>
              </span>
              <RadarChart
                compact
                stats={[
                  { label: 'Bateo', value: favPlayer.batting_average, max: 1 },
                  { label: 'Exp.', value: Math.min(favPlayer.experience / 20, 1), max: 1 },
                ]}
              />
            </div>
          )}
        </div>
      ) : (
        <p className="dashboard-card__empty">
          Visita la <em>Tabla de posiciones</em> o los perfiles de equipo/jugador y
          toca el <strong>♥</strong> para seguirlos.
        </p>
      )}
    </section>
  );
}

export default UserDashboard;