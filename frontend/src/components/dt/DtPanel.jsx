// frontend/src/components/dt/DtPanel.jsx
// Panel de Cambios del Director Técnico (referencia stitch 29/30).

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiPost } from '../../api';
import { getInitialTheme } from '../../theme';
import LandingHeader from '../landing/LandingHeader';
import './dtPanel.css';

const POS_SHORT = {
  Pitcher: 'P',
  Catcher: 'C',
  'First Base': '1B',
  'Second Base': '2B',
  'Third Base': '3B',
  Shortstop: 'SS',
  'Left Field': 'LF',
  'Center Field': 'CF',
  'Right Field': 'RF',
};

const POS_COORDS = {
  Pitcher: { top: '56%', left: '50%' },
  Catcher: { top: '90%', left: '50%' },
  'First Base': { top: '49%', left: '75%' },
  'Second Base': { top: '35%', left: '62%' },
  'Third Base': { top: '49%', left: '25%' },
  Shortstop: { top: '35%', left: '38%' },
  'Left Field': { top: '16%', left: '14%' },
  'Center Field': { top: '9%', left: '50%' },
  'Right Field': { top: '16%', left: '86%' },
};

const REASONS = [
  'Límite de lanzamientos / Situación de alto apalancamiento',
  'Matchup Favorable Derecho vs Derecho',
  'Molestia Física / Preventivo de Lesión',
  'Ajuste Estratégico de Rotación',
];

const fmt3 = (v) => (v === null || v === undefined ? '—' : Number(v).toFixed(3).replace(/^0/, ''));

const shortName = (full = '') => {
  const p = String(full).trim().split(/\s+/);
  if (p.length > 1) return `${p[0][0].toUpperCase()}. ${p.slice(1).join(' ')}`;
  return full;
};

const initials = (full = '') =>
  String(full).trim().split(/\s+/).slice(0, 2).map((w) => (w[0] || '').toUpperCase()).join('') || '·';

const posShort = (name = '') => POS_SHORT[name] || name.split(' ')[0]?.slice(0, 2).toUpperCase() || '·';

const typeLabel = (posName = '') =>
  posShort(posName) === 'P' ? 'Cambio de Lanzador (P)' : `Sustitución Defensiva (${posShort(posName)})`;

function FieldLines({ light }) {
  const foul = light ? 'rgba(15,39,68,0.45)' : 'rgba(255,255,255,0.5)';
  const warn = light ? 'rgba(107,78,20,0.35)' : 'rgba(172,136,132,0.12)';
  const grass = light ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.62)';
  const dirt = light ? 'rgba(120,72,30,0.4)' : 'rgba(84,52,38,0.55)';
  return (
    <svg className="dt__field-svg" fill="none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 760" aria-hidden="true">
      <path d="M 120 430 A 420 420 0 0 1 880 430" stroke={grass} strokeDasharray="8 6" strokeWidth="2" />
      <path d="M 60 440 A 460 460 0 0 1 940 440" stroke={warn} strokeWidth="18" />
      <line stroke={foul} strokeWidth="2.5" x1="500" x2="60" y1="700" y2="250" />
      <line stroke={foul} strokeWidth="2.5" x1="500" x2="940" y1="700" y2="250" />
      <path d="M 500 710 L 290 490 A 210 210 0 0 1 710 490 Z" fill={dirt} stroke={foul} strokeWidth="1.5" />
      <path d="M 500 700 L 310 500 Q 500 390 690 500 Z" fill={dirt} />
      <path d="M 500 690 L 670 510 L 500 330 L 330 510 Z" fill="none" stroke={grass} strokeWidth="2" />
      <circle cx="500" cy="500" fill={dirt} r="32" stroke={foul} strokeWidth="1.5" />
      <rect fill="#ffffff" height="5" rx="1" width="16" x="492" y="497" />
      <circle cx="500" cy="690" fill={dirt} r="28" stroke={foul} strokeWidth="2" />
      <polygon fill="#ffffff" points="494,687 506,687 506,694 500,700 494,694" />
      <polygon fill="#f59e0b" filter="drop-shadow(0 0 4px #f59e0b)" points="665,510 675,500 685,510 675,520" />
      <polygon fill="#f59e0b" filter="drop-shadow(0 0 4px #f59e0b)" points="495,330 505,320 515,330 505,340" />
      <polygon fill="#ffffff" opacity="0.8" points="325,510 335,500 345,510 335,520" />
    </svg>
  );
}

function DtPanel({ teamId, isLogged, userName, role, onModalOpen, onRegisterOpen, onLogout }) {
  const [theme, setTheme] = useState(() => getInitialTheme());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [teamData, setTeamData] = useState(null);
  const [games, setGames] = useState([]);
  const [swapRecords, setSwapRecords] = useState([]);

  const [selectedGame, setSelectedGame] = useState(null);
  const [lineupPlayers, setLineupPlayers] = useState([]);
  const [lineupId, setLineupId] = useState(null);
  const [available, setAvailable] = useState([]);

  const [selectedLineup, setSelectedLineup] = useState(null);
  const [selectedAvailable, setSelectedAvailable] = useState(null);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  const [motivo, setMotivo] = useState(REASONS[0]);
  const [viewMode, setViewMode] = useState('tactico');
  const [submitting, setSubmitting] = useState(false);
  const [submitOk, setSubmitOk] = useState(false);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }
    let active = true;
    const load = async () => {
      try {
        const [base, reg] = await Promise.all([
          apiGet(`/api/player-swap/${teamId}/`),
          apiGet(`/api/player-swaps/team/${teamId}/`),
        ]);
        if (!active) return;
        setTeamData(base.team_data);
        setGames(base.game_data || []);
        setSwapRecords(reg.player_swaps || []);
      } catch (err) {
        console.error(err);
        if (active) setError('Error al cargar los datos del equipo.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [teamId]);

  const handleGameChange = async (gameId) => {
    const game = games.find((g) => g.game_id === Number(gameId));
    if (!game) return;
    setSelectedGame(game);
    setSelectedLineup(null);
    setSelectedAvailable(null);
    setAvailable([]);
    try {
      const data = await apiGet(`/api/player-swap/lineup/${game.game_id}/`);
      setLineupPlayers(data.lineup_players || []);
      setLineupId(data.lineup_id);
    } catch (err) {
      console.error(err);
      setLineupPlayers([]);
      setLineupId(null);
    }
  };

  const handleSelectLineup = async (player) => {
    if (!selectedGame || !lineupId) return;
    setSelectedLineup(player);
    setSelectedAvailable(null);
    setAvailable([]);
    setLoadingAvailable(true);
    try {
      const data = await apiGet(
        `/api/player-swap/available/${teamId}/${player.position_id}/${selectedGame.series_id}/${lineupId}/`
      );
      setAvailable(data.available_players || []);
    } catch (err) {
      console.error(err);
      setAvailable([]);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedGame || !selectedLineup || !selectedAvailable) return;
    setSubmitting(true);
    setSubmitOk(false);
    try {
      const body = {
        game_team: selectedGame.game_id,
        old_player: selectedLineup.player_id,
        new_player: selectedAvailable.player_id,
        position: selectedLineup.position_id,
        date: selectedGame.date,
      };
      await apiPost('/api/player-swap/', body);
      setSubmitOk(true);
      const reg = await apiGet(`/api/player-swaps/team/${teamId}/`);
      setSwapRecords(reg.player_swaps || []);
      setTimeout(() => {
        setSubmitOk(false);
        setSelectedLineup(null);
        setSelectedAvailable(null);
        setAvailable([]);
      }, 2600);
    } catch (err) {
      console.error(err);
      alert('Error al guardar los cambios.');
    } finally {
      setSubmitting(false);
    }
  };

  const lineupCount = lineupPlayers.length;
  const avgEffectiveness = useMemo(() => {
    if (!lineupPlayers.length) return null;
    const vals = lineupPlayers.map((p) => Number(p.effectiveness)).filter((n) => !Number.isNaN(n));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }, [lineupPlayers]);

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

  if (!teamId) {
    return (
      <div className="landing dt" data-theme={theme}>
        {header}
        <div className="dt__state">
          <span className="material-symbols-outlined dt__state-icon">shield</span>
          <p>No tiene equipo que administrar</p>
          <p className="dt__state-sub">Solicita la vinculación de tu equipo al administrador de la liga.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="landing dt" data-theme={theme}>
        {header}
        <div className="dt__state">
          <span className="material-symbols-outlined dt__state-icon">error</span>
          <p>Error al cargar el panel</p>
          <p className="dt__state-sub">{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !teamData) {
    return (
      <div className="landing dt" data-theme={theme}>
        {header}
        <div className="dt__state">
          <span className="material-symbols-outlined dt__state-icon">sports_baseball</span>
          <p>Cargando panel de cambios…</p>
        </div>
      </div>
    );
  }

  const light = theme === 'light';
  const pendingCount = swapRecords.length;

  return (
    <div className="landing dt" data-theme={theme}>
      {header}
      <div className="dt__body">
        <div className="dt__crumb">
          <Link to="/" className="dt__crumb-back">
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            Panel de Cambios
          </Link>
          <div className="dt__crumb-right">
            <span className="dt__crumb-pill">
              <span className="dt__crumb-dot" aria-hidden="true" />
              Registro LNB
            </span>
            <span className="dt__crumb-id">TD · {teamData.initials}</span>
          </div>
        </div>

        <section className="dt__wbsc">
          <div className="dt__wbsc-left">
            <span className="dt__wbsc-chip">
              <span className="material-symbols-outlined" aria-hidden="true">gavel</span>
              WBSC Regla 5.10
            </span>
            <span className="dt__wbsc-text">
              Cambios de alineación autorizados hasta 45 min antes o durante el partido con confirmación hacia la Mesa Técnica.
            </span>
          </div>
          <div className="dt__wbsc-right">
            <span className="dt__wbsc-protocol">PROTOCOLO OFICIAL LNB-DT-2026</span>
            <span className="dt__wbsc-sync">
              <span className="dt__wbsc-pulse" aria-hidden="true" />
              Sync WBSC: Activo
            </span>
          </div>
        </section>

        <section className="dt__ctx">
          <div className="dt__ctx-card">
            <div className="dt__ctx-top">
              <span className="dt__ctx-label">Equipo · Panel DT</span>
              <span className="dt__ctx-flag">DT {userName || 'TITULAR'}</span>
            </div>
            <h3 className="dt__ctx-title">
              <span className="material-symbols-outlined" aria-hidden="true">shield</span>
              {teamData.name}
            </h3>
            <div className="dt__ctx-sub">Abreviatura <strong>{teamData.initials}</strong> · {teamData.representative_entity}</div>
          </div>

          <div className="dt__ctx-card">
            <div className="dt__ctx-top">
              <span className="dt__ctx-label">Juego de Temporada Regular</span>
              <span className="dt__ctx-flag" style={{ color: 'var(--dt-lights)' }}>
                {selectedGame ? `J · ${selectedGame.series_id}` : 'PREVIA'}
              </span>
            </div>
            <h3 className="dt__ctx-title">
              <span className="material-symbols-outlined" aria-hidden="true">stadium</span>
              {selectedGame ? selectedGame.rival_team : 'Selecciona un juego'}
            </h3>
            <div className="dt__select-wrap">
              <select
                className="dt__select"
                aria-label="Seleccionar juego"
                value={selectedGame ? String(selectedGame.game_id) : ''}
                onChange={(e) => handleGameChange(e.target.value)}
                disabled={!games.length}
              >
                <option value="">— Elegir juego —</option>
                {games.map((g) => (
                  <option key={g.game_id} value={g.game_id}>
                    {g.rival_team} · {g.series_name} · {g.date}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
            </div>
            {!games.length && (
              <div className="dt__ctx-sub">Sin juegos pendientes</div>
            )}
            {selectedGame && (
              <div className="dt__ctx-sub">
                {selectedGame.series_name} · <strong>{selectedGame.date}</strong>
              </div>
            )}
          </div>

          <div className="dt__ctx-card">
            <div className="dt__ctx-top">
              <span className="dt__ctx-label">Situación del Encuentro</span>
            </div>
            <div className="dt__mini">
              <div className="dt__mini-diamond">
                <div className="dt__mini-field">
                  <div className="dt__mini-base dt__mini-base--b2" />
                  <div className="dt__mini-base dt__mini-base--b3" />
                  <div className="dt__mini-base dt__mini-base--b1" />
                  <div className="dt__mini-base dt__mini-base--home" />
                </div>
              </div>
              <div className="dt__mini-meta">
                <strong>Previa del encuentro</strong>
                <span>{selectedGame ? `vs ${selectedGame.rival_team}` : 'Sin partido activo'}</span>
                <span>{selectedGame ? selectedGame.date : 'Selecciona el juego'}</span>
              </div>
            </div>
          </div>

          <div className="dt__ctx-card">
            <div className="dt__ctx-top">
              <span className="dt__ctx-label">Esquema Táctico</span>
              <span className="dt__ctx-flag" style={{ color: 'var(--dt-lights)' }}>OFICIAL · S{selectedGame?.series_id ?? '—'}</span>
            </div>
            <h3 className="dt__ctx-title dt__ctx-title--gold">
              <span className="material-symbols-outlined" aria-hidden="true">verified</span>
              Lineup Titular WBSC
            </h3>
            <div className="dt__ctx-sub">
              {lineupCount} Posiciones Activas · {pendingCount} Cambios Registrados
            </div>
          </div>
        </section>

        <section className="dt__workspace">
          <div className="dt__left">
            <div className="dt__field-head">
              <h3 className="dt__field-title">
                <span className="dt__live-dot" aria-hidden="true" />
                <span>Disposición Defensiva en Campo</span>
                <span className="dt__field-count">{lineupCount} Jugadores en Fila</span>
              </h3>
              <div className="dt__field-tabs">
                <button
                  type="button"
                  className={`dt__tab${viewMode === 'tactico' ? ' dt__tab--on' : ''}`}
                  onClick={() => setViewMode('tactico')}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">sports_baseball</span>
                  Táctico
                </button>
                <button
                  type="button"
                  className={`dt__tab${viewMode === 'metricas' ? ' dt__tab--on' : ''}`}
                  onClick={() => setViewMode('metricas')}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">show_chart</span>
                  Métricas Def.
                </button>
              </div>
            </div>

            <div className="dt__field">
              <div className="dt__field-texture" aria-hidden="true" />
              <div className="dt__field-halo" aria-hidden="true" />
              <div className="dt__field-halo dt__field-halo--r" aria-hidden="true" />
              <FieldLines light={light} />

              {lineupPlayers.length === 0 && (
                <div className="dt__empty-note">
                  <span className="material-symbols-outlined" aria-hidden="true">tour</span>
                  <p>Sin alineación cargada</p>
                  <small>Selecciona un juego para desplegar la disposición defensiva titular.</small>
                </div>
              )}

              {lineupPlayers.map((p) => {
                const coords = POS_COORDS[p.position_name] || { top: '50%', left: '50%' };
                const selected = selectedLineup?.player_id === p.player_id;
                return (
                  <div key={p.player_id} className="dt__pos" style={{ top: coords.top, left: coords.left }}>
                    <button
                      type="button"
                      className={`dt__pos-chip${selected ? ' dt__pos-chip--sel' : ''}${viewMode === 'metricas' ? ' dt__pos--metric' : ''}`}
                      onClick={() => handleSelectLineup(p)}
                      title={`${p.player_name} · ${p.position_name}`}
                    >
                      <span className="dt__pos-badge">{posShort(p.position_name)}</span>
                      <span className="dt__pos-meta">
                        <span className="dt__pos-name">{shortName(p.player_name)}</span>
                        <span className="dt__pos-ef">
                          {viewMode === 'metricas' ? `Ef. ${fmt3(p.effectiveness)}` : `AVG ${fmt3(p.effectiveness)}`}
                        </span>
                        {selected && (
                          <span className="dt__pos--swap-mark">
                            <span className="material-symbols-outlined" aria-hidden="true">swap_horiz</span>
                            Marcado
                          </span>
                        )}
                      </span>
                    </button>
                  </div>
                );
              })}

              <div className="dt__statcast">
                <span className="material-symbols-outlined" aria-hidden="true">radar</span>
                <span>Sync Telemetría LNB · Disposición titular</span>
              </div>
            </div>

            <div className="dt__metrics">
              <div className="dt__meter">
                <span className="dt__meter-label">Efectividad Media del Lineup</span>
                <span className="dt__meter-value">{avgEffectiveness != null ? fmt3(avgEffectiveness) : '—'}</span>
              </div>
              <div className="dt__meter">
                <span className="dt__meter-label">Posiciones en Fila</span>
                <span className="dt__meter-value" style={{ color: 'var(--dt-lights)' }}>{lineupCount}</span>
              </div>
              <div className="dt__meter">
                <span className="dt__meter-label">Jugadores en Reserva</span>
                <span className="dt__meter-value" style={{ color: 'var(--dt-clay)' }}>{available.length}</span>
              </div>
              <div className="dt__meter">
                <span className="dt__meter-label">Cambios Registrados</span>
                <span className="dt__meter-value">{pendingCount}</span>
              </div>
            </div>
          </div>

          <div className="dt__side">
            <div className="dt__swap">
              <div className="dt__swap-accent" aria-hidden="true" />
              <div className="dt__swap-head">
                <h3 className="dt__swap-title">
                  <span className="material-symbols-outlined" aria-hidden="true">published_with_changes</span>
                  <span>Ejecutar Sustitución</span>
                </h3>
                <span className="dt__swap-live">Live Swap</span>
              </div>
              <p className="dt__swap-desc">
                Modificación oficial de alineación bajo protocolo de tiempo reglamentario de la WBSC.
              </p>

              <div className="dt__compare">
                <div className="dt__compare-col dt__compare-col--sale">
                  <span className="dt__compare-label">
                    <span className="material-symbols-outlined" aria-hidden="true">output</span>
                    Sale del Juego
                  </span>
                  {selectedLineup ? (
                    <>
                      <span className="dt__compare-name">{shortName(selectedLineup.player_name)}</span>
                      <span className="dt__compare-sub">
                        {posShort(selectedLineup.position_name)} · AVG {fmt3(selectedLineup.effectiveness)}
                      </span>
                      <span className="dt__compare-note">Titular seleccionado</span>
                    </>
                  ) : (
                    <span className="dt__compare-placeholder">Selecciona un jugador en campo</span>
                  )}
                </div>
                <div className="dt__compare-col dt__compare-col--entra">
                  <span className="dt__compare-label">
                    <span className="material-symbols-outlined" aria-hidden="true">input</span>
                    Entra al Juego
                  </span>
                  {selectedAvailable ? (
                    <>
                      <span className="dt__compare-name">{shortName(selectedAvailable.player_name)}</span>
                      <span className="dt__compare-sub">AVG {fmt3(selectedAvailable.effectiveness)}</span>
                      <span className="dt__compare-note">
                        <span className="dt__wbsc-pulse" />
                        &nbsp;Disponible
                      </span>
                    </>
                  ) : (
                    <span className="dt__compare-placeholder">Elige un jugador del bullpen</span>
                  )}
                </div>
              </div>

              <div className="dt__reason">
                <label htmlFor="dt-reason">Causa Táctica / Justificación</label>
                <div className="dt__select-wrap">
                  <select
                    id="dt-reason"
                    className="dt__select"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                  >
                    {REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
                </div>
              </div>

              <button
                type="button"
                className={`dt__btn-primary${submitOk ? ' dt__btn-primary--ok' : ''}`}
                disabled={!selectedGame || !selectedLineup || !selectedAvailable || submitting}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
                    Transmitiendo a WBSC…
                  </>
                ) : submitOk ? (
                  <>
                    <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                    Sustitución Aprobada y Registrada
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" aria-hidden="true">send</span>
                    Confirmar y Notificar a Mesa WBSC
                  </>
                )}
              </button>

              <div className="dt__sign">
                <span className="material-symbols-outlined" aria-hidden="true">verified_user</span>
                Firma Criptográfica DT {userName || 'Titular'}
              </div>
            </div>

            <div className="dt__bullpen">
              <div className="dt__bullpen-head">
                <h3 className="dt__bullpen-title">
                  <span className="material-symbols-outlined" aria-hidden="true">sports</span>
                  <span>Bullpen &amp; Reserva Activa</span>
                </h3>
                <span className="dt__bullpen-count">{available.length} Disponibles</span>
              </div>
              <div className="dt__bullpen-filter">
                <span className="material-symbols-outlined" aria-hidden="true">filter_alt</span>
                <span>
                  Filtro: {teamData.name} · {selectedLineup ? posShort(selectedLineup.position_name) : '—'} ·{' '}
                  {selectedGame ? selectedGame.series_name : 'Serie'}
                </span>
              </div>

              <div className="dt__bullpen-list">
                {loadingAvailable && (
                  <div className="dt__empty" style={{ padding: '22px 10px' }}>Cargando reserva…</div>
                )}
                {!loadingAvailable && available.length === 0 && (
                  <div className="dt__empty" style={{ padding: '22px 10px' }}>
                    <span className="material-symbols-outlined" aria-hidden="true">sports_baseball</span>
                    {selectedLineup
                      ? 'Sin jugadores disponibles para esta posición.'
                      : 'Selecciona un jugador en campo para ver la reserva.'}
                  </div>
                )}
                {!loadingAvailable &&
                  available.map((p) => (
                    <button
                      type="button"
                      key={p.player_id}
                      className={`dt__bullpen-item${selectedAvailable?.player_id === p.player_id ? ' dt__bullpen-item--sel' : ''}`}
                      onClick={() => setSelectedAvailable(p)}
                    >
                      <span className="dt__bullpen-left">
                        <span className="dt__bullpen-tag">{initials(p.player_name)}</span>
                        <span className="dt__bullpen-meta">
                          <span className="dt__bullpen-name">{shortName(p.player_name)}</span>
                          <span className="dt__bullpen-sub">Sustituto · AVG {fmt3(p.effectiveness)}</span>
                        </span>
                      </span>
                      <span className="dt__bullpen-right">
                        <span className="dt__status">Disponible</span>
                      </span>
                    </button>
                  ))}
              </div>

              <div className="dt__bullpen-foot">
                <span>¿Requieres otro tipo de cambio?</span>
                <Link to="/dt/listar-cambios" className="dt__link">
                  Ver Historial Completo
                  <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="dt__history">
          <div className="dt__history-head">
            <div>
              <h3 className="dt__history-title">
                <span className="material-symbols-outlined" aria-hidden="true">history_edu</span>
                <span>Registro Oficial de Movimientos</span>
              </h3>
              <p className="dt__history-desc">
                Hoja de anotación sincronizada con la cabina de árbitros y el comisario WBSC.
              </p>
            </div>
            <div className="dt__history-actions">
              <Link to="/dt/listar-cambios" className="dt__btn-solid">
                <span className="material-symbols-outlined" aria-hidden="true">open_in_new</span>
                Historial Completo
              </Link>
            </div>
          </div>

          {swapRecords.length === 0 ? (
            <div className="dt__empty">
              <span className="material-symbols-outlined" aria-hidden="true">pending_actions</span>
              Aún no se registran movimientos para este equipo.
            </div>
          ) : (
            <div className="dt__table-wrap">
              <table className="dt__table">
                <thead>
                  <tr>
                    <th>Momento</th>
                    <th>Tipo de Movimiento</th>
                    <th>Sale del Campo</th>
                    <th>Entra al Campo</th>
                    <th>Razón Táctica</th>
                    <th>Dictamen WBSC</th>
                  </tr>
                </thead>
                <tbody>
                  {swapRecords.slice(0, 8).map((swap, i) => (
                    <tr key={swap.id}>
                      <td>
                        <span className="dt__tag">J · {swap.game_team}</span>
                      </td>
                      <td className="dt__td-main" style={{ color: 'var(--dt-dim)' }}>{typeLabel(swap.position_name)}</td>
                      <td>
                        <div className="dt__td-main">{swap.old_player_name}</div>
                        <div className="dt__td-sub">{swap.position_name}</div>
                      </td>
                      <td>
                        <div className="dt__td-main dt__td-main--clay">{swap.new_player_name}</div>
                      </td>
                      <td className="dt__td-muted">
                        {i === 0 ? 'Último movimiento registrado por el DT.' : 'Registrado por el DT.'}
                      </td>
                      <td>
                        <span className="dt__verdict">
                          <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                          Aprobado WBSC
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default DtPanel;