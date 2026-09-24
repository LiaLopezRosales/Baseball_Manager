import { useEffect, useState } from 'react';
import InfoLayout from './InfoLayout';
import { INFO_DISCLAIMER } from './infoContent';
import { apiPost, fetchTable } from '../../api';

// /altas-bajas — movimientos recientes (PlayerSwap) consultados vía el
// endpoint de filtrado dinámico. Si la consulta falla o no hay datos se
// muestra un aviso con el disclaimer.
function AltasBajasPage({
  isLogged,
  userName,
  role,
  onModalOpen,
  onRegisterOpen,
  onLogout,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const [swaps, players, persons, positions, teamsOnField, lineups, teams] =
          await Promise.all([
            apiPost('/api/queries/dinamic-filter/', {
              table_name: 'PlayerSwap',
              fields: ['id', 'old_player', 'new_player', 'position', 'game_team', 'date'],
              filters: {},
            }),
            fetchTable('/baseball-players/'),
            fetchTable('/persons/'),
            fetchTable('/positions/'),
            fetchTable('/teams-on-field/'),
            fetchTable('/lineups/'),
            fetchTable('/teams/'),
          ]);

        if (!alive) return;

        const personById = {};
        (persons || []).forEach((p) => {
          personById[p.id] = `${p.name} ${p.lastname}`;
        });

        const personIdByPlayer = {};
        (players || []).forEach((p) => {
          personIdByPlayer[p.id] = p.P_id;
        });

        const positionById = {};
        (positions || []).forEach((p) => {
          positionById[p.id] = p.name;
        });

        const teamIdByLineup = {};
        (lineups || []).forEach((l) => {
          teamIdByLineup[l.id] = l.team_id;
        });

        const lineupIdByTof = {};
        (teamsOnField || []).forEach((t) => {
          lineupIdByTof[t.id] = t.lineup_id;
        });

        const teamById = {};
        (teams || []).forEach((t) => {
          teamById[t.id] = t.name;
        });

        const playerName = (bpId) => personById[personIdByPlayer[bpId]] || `Jugador #${bpId}`;
        const teamName = (tofId) => {
          const teamId = teamIdByLineup[lineupIdByTof[tofId]];
          return teamById[teamId] || '—';
        };

        const data = (Array.isArray(swaps) ? swaps : [])
          .map((s) => ({
            id: s.id,
            date: s.date,
            outPlayer: playerName(s.old_player),
            inPlayer: playerName(s.new_player),
            position: positionById[s.position] || `Posición #${s.position}`,
            team: teamName(s.game_team),
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setRows(data);
        setLoading(false);
      } catch (err) {
        if (!alive) return;
        setError(err.message || 'No se pudieron cargar los movimientos.');
        setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <InfoLayout
      isLogged={isLogged}
      userName={userName}
      role={role}
      onModalOpen={onModalOpen}
      onRegisterOpen={onRegisterOpen}
      onLogout={onLogout}
      eyebrow="Reportes Oficiales · Movimientos"
      title="Altas y Bajas Semanales"
      lead="Registro de sustituciones de jugadores aprobadas para los próximos encuentros del calendario oficial."
    >
      {loading && <p className="inf__state">Cargando movimientos…</p>}

      {!loading && error && (
        <div className="inf__notice">
          <span className="material-symbols-outlined" aria-hidden="true">
            error
          </span>
          <p>
            No se pudo consultar el registro de movimientos. Inténtalo de nuevo
            más tarde.
          </p>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="inf__notice">
          <span className="material-symbols-outlined" aria-hidden="true">
            info
          </span>
          <p>No hay movimientos registrados para la temporada vigente.</p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="inf__table-wrap">
          <table className="inf__table">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Sale del juego</th>
                <th scope="col">Entra al juego</th>
                <th scope="col">Posición</th>
                <th scope="col">Equipo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleDateString('es-ES')}</td>
                  <td>{r.outPlayer}</td>
                  <td>{r.inPlayer}</td>
                  <td>{r.position}</td>
                  <td>{r.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="inf__disclaimer">
        <small>{INFO_DISCLAIMER}</small>
      </p>
    </InfoLayout>
  );
}

export default AltasBajasPage;
