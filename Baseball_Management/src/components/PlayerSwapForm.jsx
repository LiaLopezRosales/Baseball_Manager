// Baseball_Management/src/components/PlayerSwapForm.jsx

import React, { useState, useEffect } from 'react';
import './PlayerSwapForm.css';

function PlayerSwapForm({ teamId }) {
    const [teamData, setTeamData] = useState(null);
    const [games, setGames] = useState([]);
    const [lineupPlayers, setLineupPlayers] = useState([]);
    const [participations, setParticipations] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [selectedLineupPlayer, setSelectedLineupPlayer] = useState(null);
    const [selectedParticipation, setSelectedParticipation] = useState(null);
    const [lineupId, setLineupId] = useState(null); // Nuevo estado
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [positionName, setPositionName] = useState(null);


    // useEffect(() => {
    //     setSelectedGame(null);
    //     setSelectedLineupPlayer(null);
    //     setSelectedParticipation(null);
    //     setPositionName(null);
    //     setParticipations([]);
    // }, []);

    useEffect(() => {
        if (!teamId) {
            console.log("No se recibió un teamId válido.");
            return;
        }
    
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/player-swap/${teamId}/`);
                if (!response.ok) {
                    throw new Error('Error al cargar los datos del equipo');
                }
                const data = await response.json();
                const { team_data, game_data} = data;
    
                setTeamData(team_data);
                setGames(game_data);
            } catch (err) {
                console.error(err);
                setError('Error al cargar los datos.');
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, [teamId]);

    const handleGameSelect = async (game) => {
        setSelectedGame(game);
        setSelectedLineupPlayer(null); // Reinicia selección de jugador
        setPositionName(null); // Reinicia encabezado dinámico
        setParticipations([]); // Limpia jugadores disponibles

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/player-swap/lineup/${game.game_id}/`
            );
            if (!response.ok) throw new Error("Error al cargar alineación.");
            const data = await response.json();
            setLineupPlayers(data.lineup_players);
            setLineupId(data.lineup_id); // Guardar lineup_id
        } catch (err) {
            console.error(err);
            setError("Error al cargar la alineación.");
        }
    };

    const handleLineupPlayerSelect = async (player) => {
        if (!selectedGame || !lineupId) return;
        setSelectedLineupPlayer(player);
        setPositionName(player.position_name);

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/player-swap/available/${teamId}/${player.position_id}/${selectedGame.series_id}/${lineupId}/`
            );
            if (!response.ok) throw new Error("Error al cargar jugadores disponibles.");
            const data = await response.json();
            setParticipations(data.available_players);
        } catch (err) {
            console.error(err);
            setError("Error al cargar jugadores disponibles.");
        }
    };

    const handleParticipationSelect = (player) => {
        setSelectedParticipation(player);
    };

    const handleGoBack = () => {
        if (selectedGame != null && selectedLineupPlayer == null){ setSelectedGame(null) }    
        if (selectedGame != null && selectedLineupPlayer != null && selectedParticipation == null){ setSelectedLineupPlayer(null) }
        if (selectedGame != null && selectedLineupPlayer != null && selectedParticipation != null){ setSelectedParticipation(null) }
    };

    // Actualización automática de los campos de cambio
    const changeFields = {
        gameDetails: selectedGame ? `[${selectedGame.series_name}, ${selectedGame.rival_team}]` : "",
        date: selectedGame ? selectedGame.date : "",
        lineupPlayer: selectedLineupPlayer ? selectedLineupPlayer.player_name : "",
        participationPlayer: selectedParticipation ? selectedParticipation.player_name : "",
        position: selectedLineupPlayer ? selectedLineupPlayer.position_name : "",
    };

    const handleSaveChanges = async () => {
        if (!selectedGame || !selectedLineupPlayer || !selectedParticipation) {
            alert('Complete todos los campos antes de guardar.');
            return;
        }

        try {
            const data = {
                game_team: selectedGame.game_id,
                old_player: selectedLineupPlayer.player_id,
                new_player: selectedParticipation.player_id,
                position: selectedLineupPlayer.position_id,
                date: selectedGame.date,
            };

            const response = await fetch('http://127.0.0.1:8000/api/player-swap/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Error al guardar los cambios.');

            alert('Cambios guardados exitosamente.');
            // Reinicia todo después del POST
            setSelectedGame(null);
            setSelectedLineupPlayer(null);
            setSelectedParticipation(null);
            setPositionName(null);
            setParticipations([]);
        } catch (err) {
            console.error(err);
            alert('Error al guardar los cambios.');
        }
    };


    if (!teamId) {
        return <div className="error-message">No tiene equipo que administrar</div>;
    }

    if (loading) {
        return <div className="loading-message">Cargando datos...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!teamData) {
        return <div className="loading-message">Cargando datos del equipo...</div>;
    }

    return (
        <div className="player-swap-form">
            <header>
                <h1>{teamData.name} ({teamData.initials})</h1>
                <h3>{teamData.representative_entity}</h3>
            </header>

            <section className="games-section" hidden={!(selectedGame == null)}>
                <h2>Juegos Disponibles</h2>
                <table className="games-table">
                    <thead>
                        <tr>
                            <th>Rival</th>
                            <th>Serie</th>
                            <th>Fecha</th>
                            <th>Seleccionar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.map((game) => (
                            <tr key={game.game_id}>
                                <td>{game.rival_team}</td>
                                <td>{game.series_name}</td>
                                <td>{game.date}</td>
                                <td>
                                    <button onClick={() => handleGameSelect(game)}>
                                        Seleccionar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="players-section" >
                <div className="lineup-players" hidden={!(selectedGame != null && selectedLineupPlayer == null)}>
                    <h2>
                        {changeFields.gameDetails
                            ? `Jugadores de la Alineación en ${changeFields.gameDetails}`
                            : `Jugadores en Alineación`} 
                    </h2>
                    <ul>
                        {lineupPlayers.map((player) => (
                            <li key={player.player_id}>
                                {player.player_name} - {player.position_name} (Efectividad: {player.effectiveness})
                                <button onClick={() => handleLineupPlayerSelect(player)}>
                                    Seleccionar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="participation-players" hidden={!(selectedGame != null && selectedLineupPlayer != null && selectedParticipation == null)}>
                    <h2>
                        {positionName
                            ? `Jugadores Disponibles en ${positionName}`
                            : 'Jugadores Disponibles'}
                    </h2>
                    {participations.length > 0 ? (
                        <ul>
                            {participations.map((player) => (
                                <li key={player.player_id}>
                                    {player.player_name} (Efectividad: {player.effectiveness || "N/A"})
                                    <button onClick={() => handleParticipationSelect(player)}>
                                        Seleccionar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Seleccione un juego y un jugador en alineación para ver jugadores disponibles.</p>
                    )}
                </div>
            </section>

            <section className="changes-section">
                <h2>Cambio Actual</h2>
                <div>
                    <p><strong>Juego:</strong> {changeFields.gameDetails}</p>
                    <p><strong>Fecha:</strong> {changeFields.date}</p>
                    <p><strong>Jugador a Cambiar:</strong> {changeFields.lineupPlayer}</p>
                    <p><strong>Jugador Nuevo:</strong> {changeFields.participationPlayer}</p>
                    <p><strong>Posición:</strong> {changeFields.position}</p>
                </div>

                { (selectedGame != null && selectedLineupPlayer != null && selectedParticipation != null) ?
                    <button onClick={handleSaveChanges} style={{ marginRight: 15, backgroundColor: 'green'}}>Guardar Cambios</button> : ""
                }
                <button onClick={handleGoBack} hidden={selectedGame == null} style={{backgroundColor: 'purple'}}>Atrás</button>
                
            </section>
        </div>
    );
}

export default PlayerSwapForm;
