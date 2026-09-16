import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Trophy,
  Printer,
  ChevronDown,
  Info,
  ClipboardList,
  Download,
  Lock,
} from 'lucide-react';
import { apiGet } from '../api';
import RadarChart from './ui/RadarChart';
import LandingHeader from './landing/LandingHeader';
import { getInitialTheme } from '../theme';
import './playerCompare.css';

const fmtAvg = (v) =>
  v == null ? '—' : Number(v).toFixed(3).replace(/^0/, '');

const diffDelta = (a, b, decimals) =>
  '+' + Math.abs(Number(a) - Number(b)).toFixed(decimals);

/* Espejo en JS de los acentos CSS por tema (--cmp-a/--cmp-b): ECharts
   no resuelve `var(...)` en atributos SVG, así que pasamos el hex real. */
const COMPARE_COLORS = {
  dark: { a: '#38bdf8', b: '#f59e0b' },
  light: { a: '#0369a1', b: '#9a5b10' },
};

const CATEGORIES = [
  {
    key: 'batting_average',
    label: 'Promedio de bateo (AVG)',
    hint: 'Hits conectados por turno al bate',
    format: fmtAvg,
    higherBetter: true,
    delta: (a, b) => diffDelta(a, b, 3),
  },
  {
    key: 'years_of_experience',
    label: 'Años de experiencia',
    hint: 'Temporadas en liga profesional computadas',
    format: (v) => (v == null ? '—' : v),
    higherBetter: true,
    delta: (a, b) => {
      const d = Math.abs(Number(a) - Number(b));
      return `+${d} ${d === 1 ? 'año' : 'años'}`;
    },
  },
  {
    key: 'age',
    label: 'Edad biológica',
    hint: 'Factor de proyección y margen atlético',
    format: (v) => (v == null ? '—' : v),
    higherBetter: false,
    delta: (a, b) => `${diffDelta(a, b, 0)} años juventud`,
  },
  {
    key: 'effectiveness',
    label: 'Efectividad técnica ponderada',
    hint: 'Factor de jugadas defensivas y alcance homologado',
    format: fmtAvg,
    higherBetter: true,
    delta: (a, b) => diffDelta(a, b, 3),
  },
  {
    key: 'home_runs',
    label: 'Cuadrangulares (HR)',
    hint: 'Total temporada regular vigente',
    format: (v) => (v == null ? '—' : v),
    higherBetter: true,
    delta: (a, b) => `${diffDelta(a, b, 0)} HR`,
  },
  {
    key: 'rbi',
    label: 'Carreras Impulsadas (RBI)',
    hint: 'Remolcadas en posición anotadora',
    format: (v) => (v == null ? '—' : v),
    higherBetter: true,
    delta: (a, b) => `${diffDelta(a, b, 0)} RBI`,
  },
  {
    key: 'obp',
    label: 'Porcentaje de Embase (OBP)',
    hint: 'Frecuencia de alcanzar base oficial',
    format: fmtAvg,
    higherBetter: true,
    delta: (a, b) => diffDelta(a, b, 3),
  },
];

function toRadar(player) {
  return [
    { label: 'Bateo', value: Number(player.batting_average) || 0, max: 1 },
    {
      label: 'Efectividad',
      value: player.effectiveness != null ? Number(player.effectiveness) : 0,
      max: 1,
    },
    {
      label: 'Experiencia',
      value: Math.min((player.years_of_experience || 0) / 20, 1),
      max: 1,
    },
    { label: 'Edad', value: Math.min((player.age || 0) / 70, 1), max: 1 },
    { label: 'Fildeo', value: Number(player.fielding_pct) || 0, max: 1 },
    { label: 'Potencia', value: Number(player.slg) || 0, max: 1 },
  ];
}

function PlayerCard({ player, side, accent }) {
  const ops =
    player.obp != null && player.slg != null
      ? Number(player.obp) + Number(player.slg)
      : null;
  return (
    <article className={`cmp__card cmp__card--${side}`}>
      <div className="cmp__card-top">
        <div className="cmp__card-id">
          <span className="cmp__avatar" aria-hidden="true">
            <Star size={26} />
            <span className="cmp__num">#{player.bp_id}</span>
          </span>
          <div>
            <Link to={`/jugador/${player.bp_id}`} className="cmp__card-name">
              {player.name}
            </Link>
            <p className="cmp__card-pos">{player.position}</p>
            <p className="cmp__card-meta">
              {player.years_of_experience || 0}{' '}
              {player.years_of_experience === 1 ? 'Año' : 'Años'} de Exp.
            </p>
          </div>
        </div>
        <div className="cmp__war">
          <span className="cmp__war-label">WAR Total</span>
          <span className="cmp__war-value">
            {player.war != null ? Number(player.war).toFixed(1) : '—'}
          </span>
        </div>
      </div>

      <div className="cmp__radar">
        <span className="cmp__radar-label">Polígono de Rendimiento Técnico</span>
        <RadarChart stats={toRadar(player)} compact accent={accent} />
      </div>

      <div className="cmp__micro">
        <div className="cmp__micro-cell">
          <span className="cmp__micro-label">AVG Oficial</span>
          <span className="cmp__micro-value cmp__micro-value--accent">
            {fmtAvg(player.batting_average)}
          </span>
        </div>
        <div className="cmp__micro-cell">
          <span className="cmp__micro-label">OPS Global</span>
          <span className="cmp__micro-value">{fmtAvg(ops)}</span>
        </div>
        <div className="cmp__micro-cell">
          <span className="cmp__micro-label">EF Técnica</span>
          <span className="cmp__micro-value cmp__micro-value--accent">
            {fmtAvg(player.effectiveness)}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function PlayerCompare({
  isLogged,
  userName,
  role,
  onModalOpen,
  onRegisterOpen,
  onLogout,
}) {
  const [theme, setTheme] = useState(() => getInitialTheme());
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
        const infoByBp = {};
        (pips || []).forEach((p) => {
          infoByBp[String(p.BP_id)] = {
            position: posNameById[p.position] || 'Sin posición',
            effectiveness: p.effectiveness,
            fielding_pct: p.fielding_pct,
          };
        });

        const catalog = (bps || [])
          .map((bp) => {
            const per = personById[bp.P_id] || {};
            const info = infoByBp[String(bp.id)] || {};
            return {
              bp_id: bp.id,
              name: `${per.name || ''} ${per.lastname || ''}`.trim(),
              position: info.position,
              years_of_experience: bp.years_of_experience,
              age: per.age,
              batting_average: bp.batting_average,
              effectiveness: info.effectiveness,
              fielding_pct: info.fielding_pct,
              home_runs: bp.home_runs,
              rbi: bp.rbi,
              obp: bp.obp,
              slg: bp.slg,
              war: bp.war,
            };
          })
          .filter((p) => p.name);
        if (!active) return;

        catalog.sort(
          (x, y) => (y.batting_average || 0) - (x.batting_average || 0),
        );
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
        ? va > vb
          ? 'a'
          : vb > va
            ? 'b'
            : null
        : va < vb
          ? 'a'
          : vb < va
            ? 'b'
            : null;
      return { cat, winner: better };
    });
  }, [a, b]);

  const scored = results.filter((r) => r.winner != null);
  const winsA = scored.filter((r) => r.winner === 'a').length;
  const winsB = scored.filter((r) => r.winner === 'b').length;
  const total = Math.max(scored.length, 1);
  const pctA = Math.round((winsA / total) * 100);
  const pctB = 100 - pctA;

  const leader = winsA > winsB ? a : winsB > winsA ? b : null;
  const leadSide = winsA > winsB ? 'a' : winsB > winsA ? 'b' : null;
  const leadWins = Math.max(winsA, winsB);
  const colors = COMPARE_COLORS[theme] || COMPARE_COLORS.dark;

  const leadDesc = useMemo(() => {
    if (!leader || !leadSide) return null;
    const leadPlayer = leadSide === 'a' ? a : b;
    const otherPlayer = leadSide === 'a' ? b : a;
    return scored
      .filter((r) => r.winner === leadSide)
      .slice(0, 3)
      .map((r) => {
        const short = r.cat.label.split(' (')[0].toLowerCase();
        return `${short} (${r.cat.delta(
          leadPlayer[r.cat.key],
          otherPlayer[r.cat.key],
        )})`;
      })
      .join(', ');
  }, [scored, leader, leadSide, a, b]);

  const handleSelect = (setter) => (e) => {
    const found = players.find((p) => String(p.bp_id) === e.target.value);
    if (found) setter(found);
  };

  const handlePrint = () => window.print();

  const [exporting, setExporting] = useState(null);

  const buildExportData = () => {
    if (!a || !b || !results.length) return null;
    const sectionName = `Comparador Cara a Cara \u2014 ${a.name} vs ${b.name} (LNB PRO)`;
    const rows = results.map((r) => {
      const va = a[r.cat.key];
      const vb = b[r.cat.key];
      if (va == null || vb == null) return null;
      return {
        'Métrica': r.cat.label,
        'Jugador A': String(r.cat.format(va)),
        'Jugador B': String(r.cat.format(vb)),
        'Líder / Ventaja': r.winner
          ? `${r.winner === 'a' ? a.name : b.name} (${r.cat.delta(va, vb)})`
          : 'Empate',
      };
    }).filter(Boolean);
    return { [sectionName]: rows };
  };

  const handleExport = async (formats) => {
    const formatList = Array.isArray(formats) ? formats : [formats];
    const data = buildExportData();
    if (!data || !formatList.length) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setExporting(formatList.join(','));
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const firstName = a.name.split(' ')[0].toLowerCase();
      const lastName = b.name.split(' ')[0].toLowerCase();
      const filename = `comparador_${firstName}_vs_${lastName}`;
      for (const format of formatList) {
        const res = await fetch(`${base}/api/queries/export/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ format, data, filename }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const ext = format === 'csv' ? 'csv' : 'pdf';
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${ext}`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(null);
    }
  };

  if (error) {
    return (
      <div className="cmp landing" data-theme={theme}>
        <LandingHeader
          isLogged={isLogged}
          userName={userName}
          role={role}
          onModalOpen={onModalOpen}
          onRegisterOpen={onRegisterOpen}
          onLogout={onLogout}
          theme={theme}
          onThemeChange={setTheme}
          onNameChange={() => {}}
        />
        <main className="cmp__main">
          <div className="cmp__error">
            <h2>No se pudieron cargar los jugadores</h2>
            <p>{error.message}</p>
            <Link className="cmp__btn" to="/reporte/equipos-ganadores">
              Volver a Estadísticas Oficiales
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!a || !b) {
    return (
      <div className="cmp landing" data-theme={theme}>
        <LandingHeader
          isLogged={isLogged}
          userName={userName}
          role={role}
          onModalOpen={onModalOpen}
          onRegisterOpen={onRegisterOpen}
          onLogout={onLogout}
          theme={theme}
          onThemeChange={setTheme}
          onNameChange={() => {}}
        />
        <main className="cmp__main">
          <div className="cmp__loading">
            <span className="material-symbols-outlined" aria-hidden="true">
              progress_activity
            </span>
            Cargando comparador…
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="cmp landing" data-theme={theme}>
      <LandingHeader
        isLogged={isLogged}
        userName={userName}
        role={role}
        onModalOpen={onModalOpen}
        onRegisterOpen={onRegisterOpen}
        onLogout={onLogout}
        theme={theme}
        onThemeChange={setTheme}
        onNameChange={() => {}}
      />

      <main className="cmp__main">
        <div className="cmp__crumb">
          <Link to="/reporte/equipos-ganadores" className="cmp__crumb-back">
            <ArrowLeft size={15} />
            Volver a Estadísticas Oficiales
          </Link>
          <span className="cmp__crumb-path">
            <span>LNB PRO</span>
            <span>/</span>
            <span>ESTADÍSTICAS</span>
            <span>/</span>
            <strong>COMPARADOR CARA A CARA</strong>
          </span>
        </div>

        <header className="cmp__head">
          <div>
            <div className="cmp__badges">
              <span className="cmp__badge cmp__badge--red">
                ★ Módulo de Scouting &amp; Rendimiento
              </span>
              <span className="cmp__badge cmp__badge--sky">
                Normativa WBSC Homologada
              </span>
            </div>
            <h1 className="cmp__title">Comparador Oficial de Jugadores</h1>
            <p className="cmp__subtitle">
              Análisis biométrico y métrico cruzado de rendimiento Serie
              Regular 2026. Datos computados con índice de efectividad técnica
              oficial LNB.
            </p>
          </div>
          <div className="cmp__actions">
            {!isLogged ? (
              <button
                type="button"
                className="cmp__btn cmp__btn--export"
                disabled
                title="Inicia sesión para exportar"
              >
                <Lock size={14} className="cmp__btn-icon" />
                Exportar Datos
              </button>
            ) : (
              <button
                type="button"
                className="cmp__btn cmp__btn--export"
                onClick={() => handleExport(['csv', 'pdf'])}
                disabled={exporting != null}
              >
                <Download size={14} className="cmp__btn-icon" />
                {exporting
                  ? 'Generando CSV + PDF…'
                  : 'Exportar Datos'}
              </button>
            )}
            <button
              type="button"
              className="cmp__btn cmp__btn--solid"
              onClick={handlePrint}
              title="Imprimir ficha oficial de la comparación"
            >
              <Printer size={15} />
              Imprimir Ficha Oficial
            </button>
          </div>
        </header>

        <section className="cmp__selectors">
          <div className="cmp__picker cmp__picker--a">
            <label className="cmp__picker-label">
              <span>
                <span className="cmp__dot cmp__dot--a" /> Jugador A{' '}
                <em>(Seleccionado)</em>
              </span>
              <span className="cmp__picker-team">Liga Nacional 2026</span>
            </label>
            <div className="cmp__select-wrap">
              <select
                className="cmp__select"
                value={a.bp_id}
                onChange={handleSelect(setA)}
                aria-label="Seleccionar Jugador A"
              >
                {players.map((p) => (
                  <option key={p.bp_id} value={p.bp_id}>
                    {p.name} — {p.position}
                  </option>
                ))}
              </select>
              <span className="cmp__chev">
                <ChevronDown size={15} />
              </span>
            </div>
          </div>

          <div className="cmp__vs">
            <span className="cmp__vs-badge">VS</span>
            <span className="cmp__vs-caption">Serie Regular</span>
          </div>

          <div className="cmp__picker cmp__picker--b">
            <label className="cmp__picker-label">
              <span>
                <span className="cmp__dot cmp__dot--b" /> Jugador B{' '}
                <em>(Comparado)</em>
              </span>
              <span className="cmp__picker-team">Liga Nacional 2026</span>
            </label>
            <div className="cmp__select-wrap">
              <select
                className="cmp__select"
                value={b.bp_id}
                onChange={handleSelect(setB)}
                aria-label="Seleccionar Jugador B"
              >
                {players.map((p) => (
                  <option key={p.bp_id} value={p.bp_id}>
                    {p.name} — {p.position}
                  </option>
                ))}
              </select>
              <span className="cmp__chev">
                <ChevronDown size={15} />
              </span>
            </div>
          </div>
        </section>

        <div className="cmp__advance">
          <div className="cmp__advance-main">
            <div className="cmp__advance-trophy">
              <Trophy size={22} />
            </div>
            <div>
              <div className="cmp__advance-title">
                {leader ? (
                  <>
                    <h3>
                      {leader.name} LIDERA EN {leadWins} DE{" "}
                      {CATEGORIES.length} CATEGORÍAS
                    </h3>
                    <span className="cmp__advance-chip">
                      +{Math.max(pctA, pctB)}% DOMINIO
                    </span>
                  </>
                ) : (
                  <h3>Empate estratégico entre ambos perfiles</h3>
                )}
              </div>
              <p className="cmp__advance-desc">
                {leader
                  ? `${leader.name} supera en ${
                      leadDesc || 'las categorías técnicas computadas'
                    }.`
                  : 'Ningún jugador toma ventaja decisiva sobre el otro en las categorías auditadas.'}
              </p>
            </div>
          </div>
          <div className="cmp__advance-bar">
            <div className="cmp__bar" aria-hidden="true">
              <span
                className="cmp__bar--a"
                style={{ width: `${pctA}%` }}
                title={`${a.name} (${pctA}%)`}
              />
              <span
                className="cmp__bar--b"
                style={{ width: `${pctB}%` }}
                title={`${b.name} (${pctB}%)`}
              />
            </div>
            <span className="cmp__advance-score">
              {winsA}-{winsB}
            </span>
          </div>
        </div>

        <section className="cmp__cards">
          <PlayerCard player={a} side="a" accent={colors.a} />
          <PlayerCard player={b} side="b" accent={colors.b} />
        </section>

        <section className="cmp__tablesec">
          <div className="cmp__tablesec-head">
            <div>
              <h3 className="cmp__tablesec-title">
                <ClipboardList size={17} />
                Desglose Estadístico Directo Cara a Cara
              </h3>
              <p className="cmp__tablesec-sub">
                Valores auditados bajo el Estatuto Técnico Oficial LNB PRO
                (Art. 84)
              </p>
            </div>
            <span className="cmp__tablesec-cut">
              Corte Estadístico: Serie Regular 2026
            </span>
          </div>

          <div className="cmp__tablewrap">
            <table className="cmp__table">
              <thead>
                <tr>
                  <th scope="col">Métrica Auditada</th>
                  <th scope="col" className="cmp__th-a">
                    {a.name} <small>SELECCIONADO</small>
                  </th>
                  <th scope="col" className="cmp__th-b">
                    {b.name} <small>COMPARADO</small>
                  </th>
                  <th scope="col" className="cmp__th-lead">
                    Líder / Ventaja
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map(({ cat, winner }) => {
                  const leadName = winner ? (winner === 'a' ? a : b) : null;
                  const va = a[cat.key];
                  const vb = b[cat.key];
                  const delta =
                    winner && va != null && vb != null
                      ? winner === 'a'
                        ? cat.delta(va, vb)
                        : cat.delta(vb, va)
                      : null;
                  return (
                    <tr key={cat.key}>
                      <td className="cmp__metric-name">
                        <strong>{cat.label}</strong>
                        <span>{cat.hint}</span>
                      </td>
                      <td>
                        {winner === 'a' ? (
                          <span className="cmp__win cmp__win--a">
                            {cat.format(va)}
                            <Trophy size={13} />
                          </span>
                        ) : (
                          <span className="cmp__val">{cat.format(va)}</span>
                        )}
                      </td>
                      <td>
                        {winner === 'b' ? (
                          <span className="cmp__win cmp__win--b">
                            {cat.format(vb)}
                            <Trophy size={13} />
                          </span>
                        ) : (
                          <span className="cmp__val">{cat.format(vb)}</span>
                        )}
                      </td>
                      <td>
                        {winner ? (
                          <span
                            className={`cmp__lead cmp__lead--${winner}`}
                          >
                            {leadName.name}
                            <span className="cmp__lead-delta">
                              ({delta})
                            </span>
                          </span>
                        ) : (
                          <span className="cmp__lead-empty">Empate</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="cmp__disclaimer">
          <div className="cmp__disclaimer-icon">
            <Info size={20} />
          </div>
          <div>
            <h4 className="cmp__disclaimer-title">
              Criterio Regulatorio WBSC (Estatuto Técnico Art. 84)
              <span className="cmp__disclaimer-chip">CICLO 2026</span>
            </h4>
            <p>
              El índice de Efectividad Técnica (EF) sintetiza el promedio de
              fildeo ponderado, outs consumados, asistencias limpias y factor
              de alcance defensivo ajustado a la serie jugada. El corte mínimo
              para consideración al cuadro All-Star oficial es de 0.7500 en al
              menos 15 entradas reglamentarias disputadas.
            </p>
            <div className="cmp__disclaimer-actions">
              {!isLogged ? (
                <button
                  type="button"
                  className="cmp__btn cmp__btn--boletin"
                  disabled
                  title="Inicia sesión para descargar"
                >
                  <Lock size={13} />
                  Descargar Boletín Técnico (PDF)
                </button>
              ) : (
                <button
                  type="button"
                  className="cmp__btn cmp__btn--boletin"
                  onClick={() => handleExport(['pdf'])}
                  disabled={exporting != null}
                >
                  <Download size={13} />
                  {exporting ? 'Generando…' : 'Descargar Boletín Técnico (PDF)'}
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}