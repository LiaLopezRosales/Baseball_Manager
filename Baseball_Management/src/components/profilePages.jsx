import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Shield, Users, ArrowLeft } from 'lucide-react';
import { apiGet } from '../api';
import PlayerRadar from './ui/PlayerRadar';
import { FavoriteButton } from './FavoritesPanel';
import LandingHeader from './landing/LandingHeader';
import { getInitialTheme } from '../theme';
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

/* ──────────────────────────────────────────────────────────────────────────
   Perfil de jugador — LNB Pro (referencia stitch 15/16)
   Estándar: sin navbar, perfil completo, sin módulo estadístico lateral.
   ──────────────────────────────────────────────────────────────────────── */

const fmt3 = (v) =>
  v == null || Number.isNaN(Number(v)) ? '—' : Number(v).toFixed(3).replace(/^0/, '');
const clamp = (v, hi) => Math.max(0, Math.min(Number(v) || 0, hi));

const HAND_LABEL = { R: 'Diestro', L: 'Zurdo', iz: 'Zurda', der: 'Diestra' };

export function PlayerProfile({
  isLogged,
  userName,
  role,
  onModalOpen,
  onRegisterOpen,
  onLogout,
}) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => getInitialTheme());

  useEffect(() => {
    let active = true;
    apiGet(`/api/player-profile/${id}/`)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((err) => {
        if (active) setError(err);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const header = (
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
  );

  if (error) {
    return (
      <div className="landing prf" data-theme={theme}>
        {header}
        <div className="prf__state">
          <span className="material-symbols-outlined prf__state-icon">error</span>
          <p>No se pudo cargar el jugador.</p>
          <p className="prf__state-sub">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="landing prf" data-theme={theme}>
        {header}
        <div className="prf__state">
          <span className="material-symbols-outlined prf__state-icon">sports_baseball</span>
          <p>Cargando perfil del jugador…</p>
        </div>
      </div>
    );
  }

  const { person, player, team, position, fielding, pitcher } = data;
  const {
    badges = [],
    games_played: gamesPlayed,
    live_status: liveStatus,
    last_series: lastSeries = [],
    milestones,
    hito,
    ops,
    avg_rank,
    obp_rank,
    slg_rank,
    ops_rank,
    dp_rank,
    active_streak,
  } = data;

  const fullName = `${person.name} ${person.lastname}`;
  const initials = `${(person.name || '?')[0]}${(person.lastname || '?')[0]}`.toUpperCase();
  const teamColor = team?.color || 'var(--prf-clay)';
  const bio =
    person.bio && person.bio.trim()
      ? person.bio
      : 'Registro de temporada en la Liga Nacional de Béisbol. Aún no cuenta con una biografía publicada.';

  const kpis = [
    {
      label: 'Promedio (AVG)',
      value: fmt3(player.batting_average),
      footL: avg_rank ? `#${avg_rank} Liga` : 'Registro LNB',
      footR: avg_rank && avg_rank <= 3 ? 'TOP 3' : null,
      lead: true,
    },
    {
      label: 'Embasado (OBP)',
      value: fmt3(player.obp),
      footL: obp_rank ? `#${obp_rank} Liga` : 'Disciplina',
      footR: obp_rank && obp_rank <= 5 ? 'Elite' : null,
    },
    {
      label: 'Slugging (SLG)',
      value: fmt3(player.slg),
      footL: slg_rank ? `#${slg_rank} Liga` : 'Extrabases',
      footR: 'OPS ' + fmt3(ops),
    },
    {
      label: 'OPS Total',
      value: fmt3(ops),
      dot: true,
      footL: 'OBP + SLG',
      footR: ops_rank && ops_rank <= 5 ? 'WBSC Elite' : null,
    },
    {
      label: 'Defensa (FLD%)',
      value: fmt3(fielding?.fielding_pct),
      footL: 'Precisión defensiva',
      footR: fielding?.bases_stolen ? `${fielding.bases_stolen} Robos` : null,
    },
    { label: 'Experiencia', value: player.years_of_experience, footL: 'Temporadas LNB' },
    {
      label: 'Edad',
      value: person.age,
      footL: person.birth_date ? `Nac: ${person.birth_date}` : 'Nac. LNB',
    },
  ];

  const radarValues = [
    clamp((player.batting_average || 0) / 0.4 * 100, 100),   // Contacto
    clamp((player.home_runs || 0) / 40 * 100, 100),          // Poder
    clamp(((gamesPlayed || 0) / 60) * 100, 100),             // Velocidad
    clamp((fielding?.effectiveness || 0) * 100, 100),        // Alcance Defensivo
    clamp(((fielding?.assists_of || 0) / 110) * 100, 100),   // Brazo
    clamp((player.obp || 0) / 0.5 * 100, 100),               // Disciplina
  ];
  const radarLabels = ['Contacto', 'Poder', 'Velocidad', 'Alcance', 'Brazo', 'Disciplina'];
  const radarBaseline = [62, 45, 50, 64, 48, 55];
  const wbsIndex = Math.round(radarValues.reduce((a, b) => a + b, 0) / radarValues.length);

  const teleCells = [
    {
      label: 'Doble Plays',
      value: fielding?.double_plays ?? '—',
      foot: dp_rank ? `#${dp_rank} en la Liga` : 'Giros de doble matanza',
    },
    {
      label: 'Efectividad',
      value:
        fielding?.effectiveness != null
          ? `${(fielding.effectiveness * 100).toFixed(1)}%`
          : '—',
      foot: fielding?.fielding_pct != null ? `FLD% ${fmt3(fielding.fielding_pct)}` : 'Índice de rango',
    },
    {
      label: 'Asistencias',
      value: fielding?.assists_of ?? '—',
      foot: fielding?.bases_stolen != null ? `${fielding.bases_stolen} Robos` : 'Lances útiles',
    },
  ];

  const milestonesList = [
    { label: 'Juegos', value: milestones?.games ?? gamesPlayed, icon: 'sports' },
    { label: 'HR', value: milestones?.hr ?? 0, icon: 'sports_baseball' },
    { label: 'RBI', value: milestones?.rbi ?? 0, icon: 'scoreboard' },
    { label: 'AVG', value: fmt3(milestones?.avg), icon: 'trending_up' },
    { label: 'WAR', value: (milestones?.war ?? 0).toFixed(1), icon: 'military_tech' },
  ];

  const pitcherCells = [
    { label: 'G', value: pitcher?.No_games_won ?? '—' },
    { label: 'P', value: pitcher?.No_games_lost ?? '—' },
    { label: 'ERA', value: pitcher?.running_average ?? '—' },
    { label: 'K', value: pitcher?.strikeouts ?? '—' },
    { label: 'IP', value: pitcher?.innings_pitched ?? '—' },
    { label: 'SV', value: pitcher?.saves ?? '—' },
    { label: 'WHIP', value: pitcher?.whip != null ? Number(pitcher.whip).toFixed(2) : '—' },
  ];

  const handLabel = (h) =>
    h === 'izquierda' ? 'Zurdo' : h === 'derecha' ? 'Diestro' : 'Ambidiestro';

  const totalWins = lastSeries.reduce((a, s) => a + (s.wins || 0), 0);
  const totalLosses = lastSeries.reduce((a, s) => a + (s.losses || 0), 0);
  const totalGames = lastSeries.reduce((a, s) => a + (s.games || 0), 0);
  const starCount = lastSeries.filter((s) => s.star).length;

  return (
    <div className="landing prf" data-theme={theme}>
      {header}

      <div className="prf__body">
        {/* Breadcrumb */}
        <div className="prf__crumb">
          <Link to="/consultas/BaseballPlayer" className="prf__crumb-back">
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            Volver a Jugadores
          </Link>
          <div className="prf__crumb-right">
            <span className="prf__crumb-pill">
              <span className="prf__wbsc-dot" aria-hidden="true" />
              Registro Oficial LNB
            </span>
            <span className="prf__crumb-id">ID #{player.id}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="prf__hero">
          <span className="prf__blob prf__blob--top" aria-hidden="true" />
          <span className="prf__blob prf__blob--bottom" aria-hidden="true" />

          <div className="prf__hero-inner">
            <div className="prf__portrait-wrap">
              <div className="prf__portrait" style={{ '--p-team': teamColor }}>
                {person.photo ? (
                  <img src={person.photo} alt={fullName} className="prf__portrait-img" />
                ) : (
                  <span className="prf__monogram">{initials}</span>
                )}
              </div>

              <div className="prf__hero-chip prf__hero-chip--num">
                <span className="prf__hero-chip-label">No.</span>
                <span className="prf__hero-chip-val">{player.id}</span>
              </div>

              <div className="prf__hero-chip prf__hero-chip--live">
                <span className="prf__hero-chip-dot" aria-hidden="true" />
                Titular Activo
              </div>
            </div>

            <div className="prf__hero-info">
              <div className="prf__hero-tags">
                {team && (
                  <span className="prf__tag prf__tag--team" style={{ '--p-team': teamColor }}>
                    {team.name}
                  </span>
                )}
                <span className="prf__tag-sep" aria-hidden="true">•</span>
                {position && (
                  <span className="prf__tag prf__tag--pos">{position}</span>
                )}
                <span className="prf__tag-sep" aria-hidden="true">•</span>
                <span className="prf__tag">
                  B/L: <strong>{HAND_LABEL[player.bats]} / {HAND_LABEL[player.throws]}</strong>
                </span>
                {person.height_cm && person.weight_kg && (
                  <>
                    <span className="prf__tag-sep" aria-hidden="true">•</span>
                    <span className="prf__tag">
                      {Number(person.height_cm / 100).toFixed(2)} m / {person.weight_kg} kg
                    </span>
                  </>
                )}
                {person.nationality && (
                  <>
                    <span className="prf__tag-sep" aria-hidden="true">•</span>
                    <span className="prf__tag prf__tag--flag">
                      <span className="material-symbols-outlined" aria-hidden="true">flag</span>
                      {person.nationality}
                    </span>
                  </>
                )}
              </div>

              <h1 className="prf__hero-name">
                {person.name} <span className="prf__hero-name-accent">{person.lastname}</span>
              </h1>

              <p className="prf__hero-sub">
                {position || 'Pelotero'} · {team ? team.name : 'Agente libre'} ·{' '}
                {player.years_of_experience}{' '}
                {player.years_of_experience === 1 ? 'año' : 'años'} de experiencia
                {liveStatus && (
                  <span className="prf__live-pill">
                    <span className="prf__live-dot" aria-hidden="true" />
                    PRÓXIMO {liveStatus.date} vs {liveStatus.rival}
                  </span>
                )}
              </p>

              <p className="prf__hero-bio">{bio}</p>

              {badges.length > 0 && (
                <div className="prf__badges">
                  {badges.map((b) => (
                    <span key={b.label} className="prf__badge">
                      <span className="material-symbols-outlined prf__badge-icon" aria-hidden="true">
                        {b.icon}
                      </span>
                      {b.label}
                      {b.count != null && <strong>×{b.count}</strong>}
                      {b.detail && <small>{b.detail}</small>}
                    </span>
                  ))}
                </div>
              )}

              <div className="prf__hero-actions">
                <a
                  className="prf__btn prf__btn--primary"
                  href={`/api/player-profile/${player.id}/pdf/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">download</span>
                  Descargar Ficha PDF
                </a>
                <Link className="prf__btn prf__btn--ghost" to="/comparar">
                  <span className="material-symbols-outlined" aria-hidden="true">compare_arrows</span>
                  Comparar Jugador
                </Link>
                <span className="prf__hero-fav">
                  <FavoriteButton type="player" id={Number(player.id)} size={22} />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="prf__kpis" aria-label="Estadísticas principales">
          {kpis.map((k) => (
            <div key={k.label} className={`prf__kpi${k.lead ? ' prf__kpi--lead' : ''}`}>
              <span className="prf__kpi-label">
                {k.dot && <span className="prf__kpi-dot" aria-hidden="true" />}
                {k.label}
              </span>
              <div className="prf__kpi-value">{k.value}</div>
              <div className="prf__kpi-foot">
                <span className="prf__kpi-foot-l">{k.footL}</span>
                {k.footR && <span className="prf__kpi-foot-r">{k.footR}</span>}
              </div>
            </div>
          ))}
        </section>

        {/* Radar + telemetría defensiva + hito */}
        <div className="prf__split">
          <section className="prf__card prf__card--radar">
            <div className="prf__card-head">
              <div className="prf__card-head-title">
                <span className="material-symbols-outlined prf__card-icon" aria-hidden="true">radar</span>
                <div>
                  <h2 className="prf__card-title">Diamond Performance Radar</h2>
                  <p className="prf__card-sub">Evaluación 6-Ejes WBSC Statcast vs Media Posicional</p>
                </div>
              </div>
              <div className="prf__legend" aria-hidden="true">
                <span className="prf__legend-chip">
                  <i className="prf__legend-bar prf__legend-bar--accent" />
                  {initials}
                </span>
                <span className="prf__legend-chip">
                  <i className="prf__legend-bar prf__legend-bar--base" />
                  Media Liga
                </span>
              </div>
            </div>

            <div className="prf__radar-wrap">
              <PlayerRadar
                theme={theme}
                values={radarValues}
                labels={radarLabels}
                baseline={radarBaseline}
              />
            </div>

            <div className="prf__wbs">
              <span className="material-symbols-outlined prf__wbs-icon" aria-hidden="true">verified_user</span>
              <span className="prf__wbs-label">Índice de Eficiencia Global WBSC:</span>
              <span className="prf__wbs-value">
                {wbsIndex} <small>/ 100</small>
              </span>
            </div>
          </section>

          <div className="prf__side">
            <section className="prf__card prf__card--telemetry">
              <div className="prf__card-head">
                <div className="prf__card-head-title">
                  <span className="material-symbols-outlined prf__card-icon" aria-hidden="true">sports_baseball</span>
                  <h3 className="prf__card-title">Telemetría de Rango Defensivo</h3>
                </div>
                <span className="prf__chip">
                  {fielding?.fielding_pct != null ? `FLD% ${fmt3(fielding.fielding_pct)}` : 'FDF'}
                </span>
              </div>

              <div className="prf__tele-cells">
                {teleCells.map((c) => (
                  <div key={c.label} className="prf__tele-cell">
                    <span className="prf__tele-label">{c.label}</span>
                    <p className="prf__tele-value">{c.value}</p>
                    <span className="prf__tele-foot">{c.foot}</span>
                  </div>
                ))}
              </div>

              <div className="prf__sector">
                <span className="prf__sector-mark" aria-hidden="true">
                  <i />
                </span>
                <div className="prf__sector-text">
                  <strong>Sector: {position || 'Infielder'}</strong>
                  <small>
                    Tasa de conversión:{' '}
                    {fielding?.effectiveness != null
                      ? `${(fielding.effectiveness * 100).toFixed(1)}%`
                      : '—'}
                  </small>
                </div>
              </div>
            </section>

            {hito?.headline && (
              <section className="prf__card prf__card--hito">
                <span className="prf__hito-caption">Hito de Carrera Reciente</span>
                <div className="prf__hito-body">
                  <div className="prf__hito-copy">
                    <h4 className="prf__hito-title">{hito.headline}</h4>
                    <p className="prf__hito-sub">{hito.sub}</p>
                  </div>
                  <span className="material-symbols-outlined prf__hito-icon" aria-hidden="true">
                    military_tech
                  </span>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Trayectoria reciente */}
        <section className="prf__card prf__card--series">
          <div className="prf__card-head">
            <div className="prf__card-head-title">
              <span className="material-symbols-outlined prf__card-icon" aria-hidden="true">history_edu</span>
              <div>
                <h2 className="prf__card-title">Trayectoria Reciente: Últimas 5 Series</h2>
                <p className="prf__card-sub">Participación en el ciclo competitivo oficial</p>
              </div>
            </div>
            <div className="prf__racha">
              <span className="prf__racha-label">Racha Activa:</span>
              <span className="prf__chip prf__chip--accent">{active_streak} Juegos</span>
            </div>
          </div>

          <div className="prf__table-wrap">
            <table className="prf__table">
              <thead>
                <tr>
                  <th>Serie</th>
                  <th>Récord</th>
                  <th>Tipo</th>
                  <th>Temporada</th>
                  <th>Equipo</th>
                  <th className="prf__table-num">Juegos</th>
                  <th className="prf__table-num">Estrella</th>
                </tr>
              </thead>
              <tbody>
                {lastSeries.length ? (
                  lastSeries.map((s) => {
                    const hasRec = s.wins != null && s.losses != null;
                    const isWin = (s.wins || 0) > (s.losses || 0);
                    const isTie = hasRec && s.wins === s.losses;
                    const recClass = !hasRec ? '' : isWin ? ' prf__rec--w' : isTie ? '' : ' prf__rec--l';
                    return (
                      <tr key={`${s.series}-${s.season}`}>
                        <td className="prf__table-main">
                          {s.series}
                          {s.star && (
                            <span className="prf__star" title="Jugador estrella">★</span>
                          )}
                        </td>
                        <td className={recClass ? `prf__rec${recClass}` : 'prf__rec'}>
                          {hasRec ? `${s.wins}-${s.losses} ${isWin ? 'W' : isTie ? 'T' : 'L'}` : '—'}
                        </td>
                        <td>{s.type}</td>
                        <td>{s.season}</td>
                        <td className="prf__table-team">
                          {s.team_initials && (
                            <span className="prf__table-chip">{s.team_initials}</span>
                          )}
                          {s.team}
                        </td>
                        <td className="prf__table-num">{s.games}</td>
                        <td className="prf__table-num">{s.star ? '★' : '—'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="prf__table-empty">
                      Sin participaciones registradas.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2">Acumulado Últimas 5 Series</td>
                  <td>—</td>
                  <td>—</td>
                  <td className="prf__table-team">{`${totalWins}-${totalLosses}`}</td>
                  <td className="prf__table-num">{totalGames}</td>
                  <td className="prf__table-num">{starCount} ★</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Resumen de carrera + pitcheo */}
        <section className="prf__bottom">
          <div className="prf__card prf__card--milestones">
            <div className="prf__card-head">
              <div className="prf__card-head-title">
                <span className="material-symbols-outlined prf__card-icon" aria-hidden="true">emoji_events</span>
                <h2 className="prf__card-title">Resumen de Carrera</h2>
              </div>
            </div>
            <div className="prf__milestones">
              {milestonesList.map((m) => (
                <div key={m.label} className="prf__milestone">
                  <span className="prf__milestone-icon" aria-hidden="true">
                    <span className="material-symbols-outlined">{m.icon}</span>
                  </span>
                  <span className="prf__milestone-value">{m.value}</span>
                  <span className="prf__milestone-label">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {pitcher && (
            <div className="prf__card prf__card--pitcher">
              <div className="prf__card-head">
                <div className="prf__card-head-title">
                  <span className="material-symbols-outlined prf__card-icon" aria-hidden="true">sports_baseball</span>
                  <h2 className="prf__card-title">Perfil de Pitcheo</h2>
                </div>
                <span className="prf__chip">{handLabel(pitcher.dominant_hand)}</span>
              </div>
              <div className="prf__pitcher">
                {pitcherCells.map((c) => (
                  <div key={c.label} className="prf__pitcher-cell">
                    <span className="prf__pitcher-value">{c.value}</span>
                    <span className="prf__pitcher-label">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}