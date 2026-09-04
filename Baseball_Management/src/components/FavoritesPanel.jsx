import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { apiGet, apiPost } from '../api';
import './favorites.css';

export function useFavorites() {
  const [favorites, setFavorites] = useState({ teams: [], players: [] });
  const [loaded, setLoaded] = useState(false);

  const isLogged = !!localStorage.getItem('token');

  const fetchFavorites = useCallback(async () => {
    if (!isLogged) {
      setFavorites({ teams: [], players: [] });
      setLoaded(true);
      return;
    }
    try {
      const data = await apiGet('/api/user/favorites/');
      setFavorites({ teams: data.teams || [], players: data.players || [] });
    } catch {
      setFavorites({ teams: [], players: [] });
    } finally {
      setLoaded(true);
    }
  }, [isLogged]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(
    async (type, id) => {
      if (!isLogged) return false;
      try {
        const endpoint =
          type === 'team'
            ? '/api/user/favorites/team/'
            : '/api/user/favorites/player/';
        const key = type === 'team' ? 'team_id' : 'player_id';
        const res = await apiPost(endpoint, { [key]: id });
        await fetchFavorites();
        return res.favorited;
      } catch {
        return false;
      }
    },
    [isLogged, fetchFavorites]
  );

  const isFavorite = useCallback(
    (type, id) => {
      const list = type === 'team' ? favorites.teams : favorites.players;
      return list.some((f) => f.id === id);
    },
    [favorites]
  );

  return { favorites, loaded, toggleFavorite, isFavorite, refresh: fetchFavorites };
}

export function FavoriteButton({ type, id, size = 20 }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [active, setActive] = useState(false);
  const isLogged = !!localStorage.getItem('token');

  useEffect(() => {
    setActive(isFavorite(type, id));
  }, [isFavorite, type, id]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLogged) return;
    const favorited = await toggleFavorite(type, id);
    if (favorited !== false) setActive(favorited);
  };

  return (
    <button
      className={`favorite-btn${active ? ' favorite-btn--active' : ''}`}
      onClick={handleClick}
      aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      title={!isLogged ? 'Inicia sesión para guardar favoritos' : active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Heart size={size} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}

export default function FavoritesPanel() {
  const { favorites, loaded } = useFavorites();
  const isLogged = !!localStorage.getItem('token');

  if (!isLogged) return null;
  if (!loaded) return null;
  if (favorites.teams.length === 0 && favorites.players.length === 0) return null;

  return (
    <section className="landing__section favorites-panel">
      <div className="landing__section-head">
        <span className="landing__section-icon">
          <Heart size={20} />
        </span>
        <div>
          <h2 className="landing__section-title">Tus favoritos</h2>
          <p className="landing__section-sub">Equipos y jugadores que sigues</p>
        </div>
      </div>

      <div className="favorites-panel__grid">
        {favorites.teams.map((team) =>
          team.name ? (
            <Link key={`t${team.id}`} to={`/equipo/${team.id}`} className="favorites-chip">
              <span className="favorites-chip__name">{team.name}</span>
              {team.initials && <span className="favorites-chip__initials">{team.initials}</span>}
            </Link>
          ) : null
        )}
        {favorites.players.map((player) =>
          player.name ? (
            <Link key={`p${player.id}`} to={`/jugador/${player.id}`} className="favorites-chip favorites-chip--player">
              <span className="favorites-chip__name">{player.name}</span>
            </Link>
          ) : null
        )}
      </div>
    </section>
  );
}