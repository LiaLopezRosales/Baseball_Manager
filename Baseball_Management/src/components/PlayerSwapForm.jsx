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
    const [step, setStep] = useState(1); // Controla el paso actual

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    useEffect(() => {
        setSelectedGame(null);
        setSelectedLineupPlayer(null);
        setSelectedParticipation(null);
        setParticipations([]);
    }, []);

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
        setParticipations([]); // Limpia jugadores disponibles
        nextStep();

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
        nextStep();

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
        nextStep();
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
            {/* ENCABEZADO */}
            <header>
                <h1 className="team-title">{teamData.name} ({teamData.initials})</h1>
                <h3 className="team-subtitle">{teamData.representative_entity}</h3>
            </header>

            {/* STEPPER MANUAL */}
            <div className="stepper">
                <div className={`step ${step === 1 ? "active" : ""}`}>1. Seleccionar Juego</div>
                <div className={`step ${step === 2 ? "active" : ""}`}>2. Seleccionar Jugador</div>
                <div className={`step ${step === 3 ? "active" : ""}`}>3. Elegir Reemplazo</div>
                <div className={`step ${step === 4 ? "active" : ""}`}>4. Confirmar Cambio</div>
            </div>

            {/* CONTENIDO DEL STEPPER */}
            <div className="step-content">
                {step === 1 && (
                    <section className="games-section">
                        <h2>Juegos Disponibles</h2>
                        <div className="scrollable-table">
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
                                                <button className="select-button" onClick={() => handleGameSelect(game)}>Seleccionar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {step === 2 && (
                    <section className="players-section">
                        <h2>Seleccionar Jugador en Alineación</h2>
                        <div className="scrollable-table">
                            <table className="lineup-table">
                                <thead>
                                    <tr>
                                        <th>Jugador</th>
                                        <th>Posición</th>
                                        <th>Efectividad</th>
                                        <th>Seleccionar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineupPlayers.map((player) => (
                                        <tr key={player.player_id}>
                                            <td>{player.player_name}</td>
                                            <td>{player.position_name}</td>
                                            <td>{player.effectiveness !== null && player.effectiveness !== undefined ? player.effectiveness.toFixed(3) : "N/A"}</td>
                                            <td>
                                                <button className="select-button" onClick={() => handleLineupPlayerSelect(player)}>Seleccionar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {step === 3 && (
                    <section className="participation-players">
                        <h2>Seleccionar Jugador de Participación</h2>
                        <div className="scrollable-table">
                            <table className="participation-table">
                                <thead>
                                    <tr>
                                        <th>Jugador</th>
                                        <th>Efectividad</th>
                                        <th>Seleccionar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participations.map((player) => (
                                        <tr key={player.player_id}>
                                            <td>{player.player_name}</td>
                                            <td>{player.effectiveness !== null && player.effectiveness !== undefined ? player.effectiveness.toFixed(3) : "N/A"}</td>
                                            <td>
                                                <button className="select-button" onClick={() => handleParticipationSelect(player)}>Seleccionar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {step === 4 && (
                    <section className="changes-section">
                        <h2>Confirmar Cambio</h2>
                        <div>
                            <p><strong>Juego:</strong> {changeFields.gameDetails}</p>
                            <p><strong>Fecha:</strong> {changeFields.date}</p>
                            <p><strong>Jugador a Cambiar:</strong> {changeFields.lineupPlayer}</p>
                            <p><strong>Jugador Nuevo:</strong> {changeFields.participationPlayer}</p>
                            <p><strong>Posición:</strong> {changeFields.position}</p>
                        </div>
                    </section>
                )}
            </div>

            {/* BOTONES DE NAVEGACIÓN */}
            <div className="step-buttons">
                {step > 1 && <button className="back-button" onClick={prevStep}>Atrás</button>}
                {step < 4 && <button className="next-button" onClick={nextStep}>Siguiente</button>}
                {step === 4 && <button className="save-button" onClick={handleSaveChanges}>Guardar Cambios</button>}
            </div>

            {/* BOTÓN DE GUARDADO */}
            {/* <div className="save-container">
                {step === 4 && selectedGame && selectedLineupPlayer && selectedParticipation && (
                    <button onClick={handleSaveChanges} className="save-button">Guardar Cambios</button>
                )}
            </div> */}
        </div>
    );
}

export default PlayerSwapForm;
