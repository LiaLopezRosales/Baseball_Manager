import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, Heart, CalendarDays } from 'lucide-react';
import { apiGet } from '../api';
import RadarChart from './ui/RadarChart';
import './userDashboard.css';

/**
 * "Tu panel": resumen personalizado del usuario autenticado.
 * Consume GET /api/user/dashboard/ (favorito, últimos juegos, jugador favorito).
 */
function UserDashboard({ standings = [], stars = [] }) {
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
      <section id="mi-panel" className="landing__section udb">
        <p className="udb__loading">Cargando tu panel…</p>
      </section>
    );
  }

  const team = data.favorite_team;
  const index = team ? standings.findIndex((r) => r.name === team.name) : -1;
  const position = index >= 0 ? index + 1 : null;
  const teamStar = team ? stars.find((s) => s.teamId === team.id) : null;
  const favPlayer = data.favorite_players && data.favorite_players[0];
  const unread = data.unread_notifications || 0;

  return (
    <section id="mi-panel" className="landing__section udb">
      <div className="landing__section-head">
        <span className="landing__section-icon" aria-hidden="true">
          <Heart size={20} />
        </span>
        <div>
          <h2 className="landing__section-title">Tu panel</h2>
          <p className="landing__section-sub">
            {team ? `Siguiendo a ${team.name}` : 'Elige tu equipo favorito con el corazón ♥'}
          </p>
        </div>
        {unread > 0 && (
          <span className="udb__badge">
            {unread} {unread === 1 ? 'notificación' : 'notificaciones'}
          </span>
        )}
      </div>

      {team ? (
        <div className="udb__grid">
          {/* Posición en standings */}
          <div className="udb__tile">
            <Trophy size={18} className="udb__tile-icon" aria-hidden="true" />
            <span className="udb__tile-label">Posición actual</span>
            <span className="udb__tile-value">{position ? `${position}°` : '—'}</span>
            <Link to={`/equipo/${team.id}`} className="udb__link">
              Ver perfil de equipo
            </Link>
          </div>

          {/* Últimos partidos */}
          <div className="udb__tile udb__tile--wide">
            <CalendarDays size={18} className="udb__tile-icon" aria-hidden="true" />
            <span className="udb__tile-label">Últimos juegos</span>
            {data.recent_games && data.recent_games.length > 0 ? (
              <ul className="udb__games">
                {data.recent_games.slice(0, 4).map((g) => (
                  <li key={g.game_id} className="udb__game">
                    <span className="udb__game-date">{g.date}</span>
                    <span className="udb__game-rival">vs {g.rival_initials}</span>
                    <span className="udb__game-score">
                      {g.is_local ? (
                        <>
                          <strong>{g.local_score ?? '—'}</strong> – {g.rival_score ?? '—'}
                        </>
                      ) : (
                        <>
                          {g.local_score ?? '—'} – <strong>{g.rival_score ?? '—'}</strong>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="udb__tile-muted">Sin juegos aún</span>
            )}
          </div>

          {/* Estrella del equipo favorito */}
          {teamStar && (
            <div className="udb__tile">
              <Star size={18} className="udb__tile-icon" aria-hidden="true" />
              <span className="udb__tile-label">Estrella del equipo</span>
              <span className="udb__tile-value udb__tile-value--sm">
                {teamStar.bp && teamStar.bp.id ? (
                  <Link to={`/jugador/${teamStar.bp.id}`} className="udb__link">
                    {teamStar.fullName}
                  </Link>
                ) : (
                  teamStar.fullName
                )}
              </span>
              <span className="udb__tile-muted">Posición: {teamStar.label}</span>
            </div>
          )}

          {/* Jugador favorito con radar */}
          {favPlayer && (
            <div className="udb__tile udb__tile--chart">
              <Star size={18} className="udb__tile-icon" aria-hidden="true" />
              <span className="udb__tile-label">
                <Link to={`/jugador/${favPlayer.id}`} className="udb__link">
                  {favPlayer.name}
                </Link>
              </span>
              <RadarChart
                compact
                stats={[
                  { label: 'Bateo', value: Number(favPlayer.batting_average) || 0, max: 1 },
                  { label: 'Exp.', value: Math.min((Number(favPlayer.experience) || 0) / 20, 1), max: 1 },
                ]}
              />
            </div>
          )}
        </div>
      ) : (
        <p className="udb__empty">
          Visita el perfil de un <em>equipo</em> o <em>jugador</em> y toca el{' '}
          <strong>♥</strong> para seguirlo. Aquí verás su posición, últimos juegos y
          estadísticas.
        </p>
      )}
    </section>
  );
}

export default UserDashboard;
