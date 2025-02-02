import React, { useState, useEffect, useCallback } from "react";
import "./PlayerSwapTable.css";

const PlayerSwapTable = ({ teamId }) => {
    const [teamData, setTeamData] = useState(null);
    const [playerSwaps, setPlayerSwaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Función para obtener datos del equipo y los cambios de jugadores
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/player-swaps/team/${teamId}/`);
            if (!response.ok) throw new Error("Error al cargar datos.");
            const data = await response.json();
            setTeamData(data.team_data);
            setPlayerSwaps(data.player_swaps);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    // Cargar datos al montar el componente o cuando `teamId` cambie
    useEffect(() => {
        if (teamId) fetchData();
    }, [teamId, fetchData]);

    // Función para ordenar los datos por columna
    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === "ascending" ? "descending" : "ascending";
        setSortConfig({ key, direction });

        const sortedData = [...playerSwaps].sort((a, b) => {
            if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
            if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
            return 0;
        });

        setPlayerSwaps(sortedData);
    };

    // Función para eliminar un cambio de jugador
    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este cambio?")) return;
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/player-swaps/delete/${id}/`, { method: "DELETE" });
            if (!response.ok) throw new Error("Error al eliminar el cambio.");
            setPlayerSwaps(playerSwaps.filter((swap) => swap.id !== id)); // Filtrar la lista sin el eliminado
        } catch (err) {
            alert("Error al eliminar el cambio.");
        }
    };

    // Obtener datos paginados según la página actual
    const totalPages = Math.ceil(playerSwaps.length / itemsPerPage);
    const paginatedData = playerSwaps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="player-swap-table">
            {/* Mensajes de carga y error */}
            {loading && <p>Cargando datos...</p>}
            {error && <p className="error">{error}</p>}

            {teamData && (
                <>
                    {/* Información del equipo */}
                    <h1>{teamData.name} ({teamData.initials})</h1>
                    <h3>{teamData.representative_entity}</h3>

                    {/* Botón para actualizar los datos */}
                    <button onClick={fetchData} className="refresh-button">Actualizar</button>

                    {/* Tabla de cambios de jugadores */}
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort("game_team")}>ID Equipo en el Campo</th>
                                <th onClick={() => handleSort("old_player_name")}>Jugador Anterior</th>
                                <th onClick={() => handleSort("new_player_name")}>Jugador Nuevo</th>
                                <th onClick={() => handleSort("position_name")}>Posición</th>
                                <th onClick={() => handleSort("date")}>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((swap) => (
                                <tr key={swap.id}>
                                    <td>{swap.game_team}</td>
                                    <td>{swap.old_player_name}</td>
                                    <td>{swap.new_player_name}</td>
                                    <td>{swap.position_name}</td>
                                    <td>{swap.date}</td>
                                    <td>
                                        <button onClick={() => handleDelete(swap.id)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Controles de paginación */}
                    <div className="pagination-controls">
                        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                            Anterior
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                            Siguiente
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PlayerSwapTable;
