import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GitCompare, Star, Trophy } from 'lucide-react';
import { apiGet } from '../api';
import RadarChart from './ui/RadarChart';
import './playerCompare.css';

const CATEGORIES = [
  {
    key: 'batting_average',
    label: 'Promedio de bateo',
    format: (v) => (v == null ? '—' : Number(v).toFixed(3)),
    higherBetter: true,
  },
  {
    key: 'years_of_experience',
    label: 'Años de experiencia',
    format: (v) => (v == null ? '—' : v),
    higherBetter: true,
  },
  {
    key: 'age',
    label: 'Edad',
    format: (v) => (v == null ? '—' : v),
    higherBetter: false,
  },
  {
    key: 'effectiveness',
    label: 'Efectividad',
    format: (v) => (v == null ? '—' : Number(v).toFixed(3)),
    higherBetter: true,
  },
];

function toRadar(player) {
  return [
    { label: 'Bateo', value: Number(player.batting_average) || 0, max: 1 },
    { label: 'Experiencia', value: Math.min((player.years_of_experience || 0) / 20, 1), max: 1 },
    { label: 'Edad', value: Math.min((player.age || 0) / 70, 1), max: 1 },
    { label: 'Efectividad', value: player.effectiveness != null ? Number(player.effectiveness) : 0, max: 1 },
  ];
}

export default function PlayerCompare() {
  const [players, setPlayers] = useState([]);
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiGet('/baseball-players/'),
      apiGet('/persons/'),
      apiGet('/players-in-position/'),
      apiGet('/positions/'),
    ])
      .then(([bps, persons, pips, positions]) => {
        if (!active) return;
        const personById = {};
        (persons || []).forEach((p) => {
          personById[p.id] = p;
        });
        const posNameById = {};
        (positions || []).forEach((p) => {
          posNameById[p.id] = p.name;
        });
        const effByBp = {};
        (pips || []).forEach((p) => {
          effByBp[String(p.BP_id)] = {
            position: posNameById[p.position] || 'Sin posición',
            effectiveness: p.effectiveness,
          };
        });

        const catalog = (bps || [])
          .map((bp) => {
            const per = personById[bp.P_id] || {};
            const eff = effByBp[String(bp.id)] || {};
            return {
              id: bp.id,
              name: `${per.name || ''} ${per.lastname || ''}`.trim(),
              batting_average: bp.batting_average,
              years_of_experience: bp.years_of_experience,
              age: per.age,
              position: eff.position,
              effectiveness: eff.effectiveness,
            };
          })
          .filter((p) => p.name);
        if (!active) return;

        catalog.sort((x, y) => (y.batting_average || 0) - (x.batting_average || 0));
        setPlayers(catalog);
        setA(catalog[0] || null);
        setB(catalog[1] || null);
      })
      .catch((err) => {
        if (active) setError(err);
      });
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    if (!a || !b) return [];
    return CATEGORIES.map((cat) => {
      const va = a[cat.key];
      const vb = b[cat.key];
      if (va == null || vb == null) return { cat, winner: null };
      const better = cat.higherBetter
        ? (va > vb ? 'a' : vb > va ? 'b' : null)
        : (va < vb ? 'a' : vb < va ? 'b' : null);
      return { cat, winner: better };
    });
  }, [a, b]);

  const winsA = results.filter((r) => r.winner === 'a').length;
  const winsB = results.filter((r) => r.winner === 'b').length;

  if (error) {
    return (
      <div className="compare">
        <p className="compare__error">No se pudieron cargar los jugadores.</p>
        <p className="muted">{error.message}</p>
      </div>
    );
  }

  if (!a || !b) {
    return <div className="compare compare--loading">Cargando jugadores…</div>;
  }

  const handleSelect = (setter) => (e) => {
    const found = players.find((p) => String(p.id) === e.target.value);
    if (found) setter(found);
  };

  return (
    <div className="compare">
      <Link to="/" className="compare__back">
        <ArrowLeft size={16} /> Volver al inicio
      </Link>

      <header className="compare__header">
        <div className="compare__title-wrap">
          <GitCompare size={22} className="compare__title-icon" />
          <h1 className="compare__title">Comparar jugadores</h1>
        </div>
        <p className="compare__hint">
          Elige dos jugadores y compara su rendimiento lado a lado.
        </p>
      </header>

      <div className="compare__pickers">
        <div className="compare__picker">
          <label className="compare__picker-label">Jugador A</label>
          <select
            className="compare__select"
            value={a.id}
            onChange={handleSelect(setA)}
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="compare__picker">
          <label className="compare__picker-label">Jugador B</label>
          <select
            className="compare__select"
            value={b.id}
            onChange={handleSelect(setB)}
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="compare__verdict">
        {winsA === winsB ? (
          <p>Empate en categorías igualadas</p>
        ) : (
          <p className="compare__verdict-winner">
            <Trophy size={16} />
            {winsA > winsB ? a.name : b.name} lidera en{' '}
            {Math.max(winsA, winsB)} de {CATEGORIES.length} categorías
          </p>
        )}
      </div>

      <div className="compare__columns">
        <div
          className={`compare__column${winsA >= winsB ? ' compare__column--better' : ''}`}
        >
          <div className="compare__column-head">
            <span className="compare__avatar">
              <Star size={18} />
            </span>
            <Link to={`/jugador/${a.id}`} className="compare__name-link">
              {a.name}
            </Link>
            <span className="compare__position">{a.position}</span>
          </div>
          <RadarChart stats={toRadar(a)} compact />
        </div>

        <div
          className={`compare__column${winsB >= winsA ? ' compare__column--better' : ''}`}
        >
          <div className="compare__column-head">
            <span className="compare__avatar">
              <Star size={18} />
            </span>
            <Link to={`/jugador/${b.id}`} className="compare__name-link">
              {b.name}
            </Link>
            <span className="compare__position">{b.position}</span>
          </div>
          <RadarChart stats={toRadar(b)} compact />
        </div>
      </div>

      <div className="compare__table-wrap">
        <table className="compare__table">
          <thead>
            <tr>
              <th>Métrica</th>
              <th>{a.name}</th>
              <th>{b.name}</th>
              <th className="compare__table-result">Mejor</th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ cat, winner }) => (
              <tr key={cat.key}>
                <td className="compare__table-label">{cat.label}</td>
                <td className={winner === 'a' ? 'compare__cell--win' : ''}>
                  {cat.format(a[cat.key])}
                  {winner === 'a' && <Trophy size={14} className="compare__trophy" />}
                </td>
                <td className={winner === 'b' ? 'compare__cell--win' : ''}>
                  {cat.format(b[cat.key])}
                  {winner === 'b' && <Trophy size={14} className="compare__trophy" />}
                </td>
                <td className="compare__table-result">
                  {winner ? (winner === 'a' ? a.name : b.name) : 'Empate'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}