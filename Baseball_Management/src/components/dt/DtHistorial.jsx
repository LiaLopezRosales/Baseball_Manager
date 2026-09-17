// Baseball_Management/src/components/dt/DtHistorial.jsx
// Historial completo de cambios DT (referencia stitch 29/30 — tabla broadcast).

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiDelete } from '../../api';
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

const posShort = (name = '') => POS_SHORT[name] || name.split(' ')[0]?.slice(0, 2).toUpperCase() || '·';

const typeLabel = (posName = '') =>
  posShort(posName) === 'P' ? 'Cambio de Lanzador (P)' : `Sustitución Defensiva (${posShort(posName)})`;

const ITEMS_PER_PAGE = 10;

function DtHistorial({ teamId, isLogged, userName, role, onModalOpen, onRegisterOpen, onLogout }) {
  const [theme, setTheme] = useState(() => getInitialTheme());
  const [teamData, setTeamData] = useState(null);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiGet(`/api/player-swaps/team/${teamId}/`);
      setTeamData(data.team_data);
      setSwaps(data.player_swaps || []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId) fetchData();
  }, [teamId, fetchData]);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    setSortConfig({ key, direction });
  };

  const sortedSwaps = useMemo(() => {
    const { key, direction } = sortConfig;
    return [...swaps].sort((a, b) => {
      let av = a[key];
      let bv = b[key];
      if (key === 'date') {
        av = String(av);
        bv = String(bv);
      } else {
        av = String(av ?? '');
        bv = String(bv ?? '');
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return direction === 'ascending' ? cmp : -cmp;
    });
  }, [swaps, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedSwaps.length / ITEMS_PER_PAGE));
  const pageRows = sortedSwaps.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este cambio?')) return;
    try {
      await apiDelete(`/api/player-swaps/delete/${id}/`);
      setSwaps((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el cambio.');
    }
  };

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
          <p>Error al cargar el historial</p>
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
          <span className="material-symbols-outlined dt__state-icon">history_edu</span>
          <p>Cargando historial…</p>
        </div>
      </div>
    );
  }

  const sortArrow = (key) =>
    sortConfig.key === key ? (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓') : '';

  return (
    <div className="landing dt" data-theme={theme}>
      {header}
      <div className="dt__body">
        <div className="dt__crumb">
          <Link to="/dt/cambios" className="dt__crumb-back">
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            Panel de Cambios
          </Link>
          <div className="dt__crumb-right">
            <span className="dt__crumb-pill">
              <span className="dt__crumb-dot" aria-hidden="true" />
              Historial Oficial
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
              Registro oficial de movimientos sincronizado con la cabina de árbitros y el comisario WBSC.
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

        <section className="dt__history">
          <div className="dt__history-head">
            <div>
              <h3 className="dt__history-title">
                <span className="material-symbols-outlined" aria-hidden="true">history_edu</span>
                <span>Historial Oficial de Movimientos · {teamData.name}</span>
              </h3>
              <p className="dt__history-desc">
                {swaps.length} movimientos registrados para {teamData.initials} · Ordena por columna o elimina un registro.
              </p>
            </div>
            <div className="dt__history-actions">
              <button type="button" className="dt__btn-ghost" onClick={fetchData}>
                <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
                Actualizar
              </button>
              <Link to="/dt/cambios" className="dt__btn-solid">
                <span className="material-symbols-outlined" aria-hidden="true">swap_horiz</span>
                Nuevo Cambio
              </Link>
            </div>
          </div>

          {sortedSwaps.length === 0 ? (
            <div className="dt__empty">
              <span className="material-symbols-outlined" aria-hidden="true">pending_actions</span>
              Aún no se registran movimientos para este equipo.
            </div>
          ) : (
            <>
              <div className="dt__table-wrap">
                <table className="dt__table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('game_team')}>ID Juego{sortArrow('game_team')}</th>
                      <th>Tipo de Movimiento</th>
                      <th onClick={() => handleSort('old_player_name')}>Sale del Campo{sortArrow('old_player_name')}</th>
                      <th onClick={() => handleSort('new_player_name')}>Entra al Campo{sortArrow('new_player_name')}</th>
                      <th onClick={() => handleSort('position_name')}>Posición{sortArrow('position_name')}</th>
                      <th onClick={() => handleSort('date')}>Fecha{sortArrow('date')}</th>
                      <th>Dictamen WBSC</th>
                      <th className="dt__th-right" style={{ textAlign: 'right' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((swap) => (
                      <tr key={swap.id}>
                        <td>
                          <span className="dt__tag">J · {swap.game_team}</span>
                        </td>
                        <td className="dt__td-main" style={{ color: 'var(--dt-dim)' }}>{typeLabel(swap.position_name)}</td>
                        <td>
                          <div className="dt__td-main">{swap.old_player_name}</div>
                        </td>
                        <td>
                          <div className="dt__td-main dt__td-main--clay">{swap.new_player_name}</div>
                          <div className="dt__td-sub">{swap.position_name}</div>
                        </td>
                        <td className="dt__td-sub">{posShort(swap.position_name)}</td>
                        <td>
                          <span className="dt__td-sub">{swap.date}</span>
                        </td>
                        <td>
                          <span className="dt__verdict">
                            <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                            Aprobado WBSC
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="dt__btn-danger"
                            onClick={() => handleDelete(swap.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="dt__pager">
                <button
                  type="button"
                  className="dt__pager-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <span className="dt__pager-info">Página {currentPage} de {totalPages}</span>
                <button
                  type="button"
                  className="dt__pager-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default DtHistorial;