import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Shield, Users, Star, ArrowLeft, Target } from 'lucide-react';
import { apiGet } from '../api';
import RadarChart from './ui/RadarChart';
import { FavoriteButton } from './FavoritesPanel';
import './profilePages.css';

export function TeamProfile() {
  const { id } = useParams();
  const teamId = id;
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiGet(`/teams/${teamId}/`),
      apiGet('/baseball-players/'),
      apiGet('/persons/'),
      apiGet('/players-in-position/'),
      apiGet('/positions/'),
    ])
      .then(
        ([teamData, allPlayers, persons, posData, posList]) => {
          if (!active) return;
          return apiGet(
            `/api/queries/reports/?report_id=8&team_name=${encodeURIComponent(
              teamData.name
            )}`
          ).then((teamPlayers) => {
            if (!active) return;
            const personById = {};
            (persons || []).forEach((p) => {
              personById[p.id] = p;
            });
            const idByName = {};
            (allPlayers || []).forEach((pl) => {
              const per = personById[pl.P_id];
              if (per)
                idByName[`${per.name} ${per.lastname}`.toLowerCase()] = pl.id;
            });
            const posNameById = {};
            (posList || []).forEach((p) => {
              posNameById[p.id] = p.name;
            });
            const effByBp = {};
            (posData || []).forEach((p) => {
              effByBp[p.BP_id] = { pos: p.position, eff: p.effectiveness };
            });

            const rows = (teamPlayers || []).map((tp) => {
              const bpId = idByName[`${tp.Nombre} ${tp.Apellido}`.toLowerCase()];
              const eff = effByBp[bpId] || {};
              return {
                id: bpId,
                name: `${tp.Nombre} ${tp.Apellido}`,
                position: posNameById[eff.pos] || '—',
                effectiveness: eff.eff,
                seriesCount: (tp.Series || []).length,
              };
            });

            setTeam(teamData);
            setPlayers(rows);
          });
        }
      )
      .catch((err) => {
        if (active) setError(err);
      });
    return () => {
      active = false;
    };
  }, [teamId]);

  if (error) {
    return (
      <div className="profile">
        <p className="profile__error">No se pudo cargar el equipo.</p>
        <p className="muted">{error.message}</p>
      </div>
    );
  }

  if (!team) {
    return <div className="profile profile--loading">Cargando equipo…</div>;
  }

  return (
    <div className="profile">
      <Link to="/" className="profile__back">
        <ArrowLeft size={16} /> Volver al inicio
      </Link>

      <header className="profile__header">
        <div className="profile__avatar" style={{ background: team.color || 'var(--accent)' }}>
          <Shield size={34} />
        </div>
        <div>
          <h1 className="profile__name">{team.name}</h1>
          <p className="profile__meta">
            {team.initials} · {team.representative_entity}
          </p>
        </div>
        <FavoriteButton type="team" id={Number(teamId)} size={22} />
      </header>

      <section className="profile__section">
        <h2 className="profile__section-title">
          <Users size={18} /> Jugadores del equipo
        </h2>
        <p className="profile__hint">
          Vista del equipo en la temporada actual. Enlaza al perfil de cada jugador.
        </p>
        <div className="profile__players">
          {players.length ? (
            players.map((p) => (
              <Link key={p.id} to={`/jugador/${p.id}`} className="profile__player">
                <span className="profile__player-name">{p.name}</span>
                <span className="profile__player-pos">{p.position}</span>
                <span className="profile__player-eff">
                  {p.effectiveness != null ? Number(p.effectiveness).toFixed(3) : '—'}
                </span>
              </Link>
            ))
          ) : (
            <p className="muted">Cargando jugadores…</p>
          )}
        </div>
      </section>
    </div>
  );
}

export function PlayerProfile() {
  const { id } = useParams();
  const bpId = id;
  const [player, setPlayer] = useState(null);
  const [person, setPerson] = useState(null);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiGet(`/baseball-players/${bpId}/`),
      apiGet('/players-in-position/'),
      apiGet('/positions/'),
    ])
      .then(([playerData, posData, posList]) => {
        if (!active) return;
        return Promise.all([
          playerData,
          apiGet(`/persons/${playerData.P_id}/`),
          posData.find((p) => String(p.BP_id) === String(playerData.id)) || null,
          posList,
        ]);
      })
      .then(([playerData, personData, myPos, posList]) => {
        if (!active) return;
        setPlayer(playerData);
        setPerson(personData);
        const posName =
          myPos &&
          posList.find((p) => String(p.id) === String(myPos.position));
        setPosition(posName ? posName.name : 'Sin posición');
      })
      .catch((err) => {
        if (active) setError(err);
      });
    return () => {
      active = false;
    };
  }, [bpId]);

  if (error) {
    return (
      <div className="profile">
        <p className="profile__error">No se pudo cargar el jugador.</p>
        <p className="muted">{error.message}</p>
      </div>
    );
  }

  if (!player || !person) {
    return <div className="profile profile--loading">Cargando jugador…</div>;
  }

  const fullName = `${person.name} ${person.lastname}`;

  return (
    <div className="profile">
      <Link to="/" className="profile__back">
        <ArrowLeft size={16} /> Volver al inicio
      </Link>

      <header className="profile__header">
        <div className="profile__avatar profile__avatar--player">
          <Star size={34} />
        </div>
        <div>
          <h1 className="profile__name">{fullName}</h1>
          <p className="profile__meta">{position}</p>
        </div>
        <FavoriteButton type="player" id={Number(bpId)} size={22} />
      </header>

      <section className="profile__section">
        <h2 className="profile__section-title">
          <Target size={18} /> Estadísticas
        </h2>
        <div className="profile__stats">
          <div className="profile__stat">
            <span className="profile__stat-label">Promedio de bateo</span>
            <span className="profile__stat-value">
              {Number(player.batting_average).toFixed(3)}
            </span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-label">Años de experiencia</span>
            <span className="profile__stat-value">
              {player.years_of_experience}
            </span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-label">Edad</span>
            <span className="profile__stat-value">{person.age}</span>
          </div>
        </div>
      </section>

      <section className="profile__section">
        <RadarChart
          title="Rendimiento"
          stats={[
            { label: 'Bateo', value: player.batting_average, max: 1 },
            { label: 'Experiencia', value: Math.min(player.years_of_experience / 20, 1), max: 1 },
            { label: 'Edad', value: Math.min(person.age / 70, 1), max: 1 },
          ]}
        />
      </section>
    </div>
  );
}
