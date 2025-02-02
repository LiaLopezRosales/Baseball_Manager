import React, { useState } from 'react';
import './sidebar.css';

function Sidebar({ role, onOptionSelect, onModalOpen }) {
    const [showReports, setShowReports] = useState(false);
    const [showForms, setShowForms] = useState(false);
    const [showQueries, setShowQueries] = useState(false); // Nuevo estado para las consultas

    const handleReportsClick = () => {
        setShowReports(!showReports);
    };

    const handleFormsClick = () => {
        setShowForms(!showForms);
    };

    const handleQueriesClick = () => {
        setShowQueries(!showQueries); // Función para manejar el clic en "Consultas"
    };

    // Función para manejar la selección de una consulta
    const handleQuerySelect = (table) => {
        onOptionSelect('Qy', table); // Pasamos 'Qy' como selectedOption y la tabla como valor adicional
    };

    return (
        <div className='sidebar'>
            <div className='sidebar-content'>
                <ul>
                    <li onClick={() => onOptionSelect('Main')}>Main</li>

                    {/* Botón "Consultas" con una flecha que cambia de dirección */}
                    <li onClick={handleQueriesClick}>
                        Consultas {showQueries ? '▼' : '▶'}
                    </li>

                    {/* Lista de consultas (se muestra solo si showQueries es true) */}
                    {showQueries && (
                        <ul>
                            <li onClick={() => handleQuerySelect('Team')}>Equipos</li>
                            <li onClick={() => handleQuerySelect('Game')}>Juegos</li>
                            <li onClick={() => handleQuerySelect('Series')}>Series</li>
                            <li onClick={() => handleQuerySelect('Worker')}>Trabajadores</li>
                            <li onClick={() => handleQuerySelect('DirectionTeam')}>Equipos de Dirección</li>
                            <li onClick={() => handleQuerySelect('BaseballPlayer')}>Jugadores de Baseball</li>
                            <li onClick={() => handleQuerySelect('Season')}>Temporadas</li>
                            <li onClick={() => handleQuerySelect('Pitcher')}>Pitchers</li>
                            <li onClick={() => handleQuerySelect('TeamOnTheField')}>Equipo en Campo</li>
                            <li onClick={() => handleQuerySelect('StarPlayer')}>Jugador Estrella</li>
                            <li onClick={() => handleQuerySelect('PlayerInPosition')}>Jugadores en Posición</li>
                            <li onClick={() => handleQuerySelect('Score')}>Puntuaciones</li>
                            <li onClick={() => handleQuerySelect('BPParticipation')}>Participación de los Jugadores</li>
                            <li onClick={() => handleQuerySelect('PlayerSwap')}>Cambio de Jugador</li>
                            <li onClick={() => handleQuerySelect('PlayerInLineUp')}>Jugadores en Alineación</li>
                        </ul>
                    )}

                    <li onClick={handleReportsClick}>
                        Estadísticas {showReports ? '▼' : '▶'}
                    </li>

                    {showReports && (
                        <ul>
                            <li onClick={() => onOptionSelect('Equipos ganadores y directores técnicos por temporadas')}>
                                Equipos ganadores y directores técnicos por temporadas
                            </li>
                            <li onClick={() => onOptionSelect('Jugadores estrellas')}>
                                Jugadores estrella por serie
                            </li>
                            <li onClick={() => onOptionSelect('Primer y último lugar')}>
                                Primer y último lugar por serie/temporada
                            </li>
                            <li onClick={() => onOptionSelect('Series con más/menos juegos celebrados')}>
                                Series con más/menos juegos celebrados
                            </li>
                            <li onClick={() => onOptionSelect('Carreras limpias/juegos ganados')}>
                                Carreras limpias/juegos ganados por un pitcher
                            </li>
                            <li onClick={() => onOptionSelect('Average')}>
                                Average de bateo de cada Jugador
                            </li>
                            <li onClick={() => onOptionSelect('Estadísticas de juegos por equipos')}>
                                Estadísticas de juegos por equipos
                            </li>
                            <li onClick={() => onOptionSelect('Efectividad por posición')}>
                                Jugadores con más efectividad por posición
                            </li>
                            <li onClick={() => onOptionSelect('Jugadores de un equipo')}>
                                Jugadores de un equipo
                            </li>
                        </ul>
                    )}

                    {role === 'Admin' && (
                        <>
                            <li onClick={handleFormsClick}>
                                Formularios {showForms ? '▼' : '▶'}
                            </li>

                            {showForms && (
                                <ul>
                                    <li onClick={() => onOptionSelect('Usuarios')}>Usuarios</li>
                                    <li onClick={() => onOptionSelect('Personas')}>Personas</li>
                                    <li onClick={() => onOptionSelect('Trabajadores')}>Trabajadores</li>
                                    <li onClick={() => onOptionSelect('Jugadores')}>Jugadores</li>
                                    <li onClick={() => onOptionSelect('Pitchers')}>Lanzadores</li>
                                    <li onClick={() => onOptionSelect('Direction Team')}>Equipos de Dirección</li>
                                    <li onClick={() => onOptionSelect('Directores Técnicos')}>Directores Técnicos</li>
                                    <li onClick={() => onOptionSelect('Temporadas')}>Temporadas</li>
                                    <li onClick={() => onOptionSelect('Series')}>Series</li>
                                    <li onClick={() => onOptionSelect('Juegos')}>Juegos</li>
                                    <li onClick={() => onOptionSelect('Puntuaciones')}>Marcadores</li>
                                    <li onClick={() => onOptionSelect('Equipos')}>Equipos</li>
                                    <li onClick={() => onOptionSelect('Alineaciones')}>Alineaciones</li>
                                    <li onClick={() => onOptionSelect('Jugadores en Alineación')}>Jugadores en Alineación</li>
                                    <li onClick={() => onOptionSelect('Intercambios de Jugadores')}>Cambios de Jugador</li>
                                    <li onClick={() => onOptionSelect('Equipos en el Campo')}>Equipos en el Campo</li>
                                    <li onClick={() => onOptionSelect('BP Participations')}>Participación de Jugadores</li>
                                    <li onClick={() => onOptionSelect('Posiciones')}>Posiciones</li>
                                    <li onClick={() => onOptionSelect('Jugadores en Posición')}>Jugadores en Posición</li>
                                    <li onClick={() => onOptionSelect('Jugadores Estrella')}>Jugadores Estrella</li>
                                </ul>
                            )}
                        </>
                    )}

                    {role === 'Director Técnico' && (
                        <>
                            <li onClick={handleFormsClick}>
                                Gestión de Alineaciones {showForms ? '▼' : '▶'}
                            </li>

                            {showForms && (
                                <ul>
                                    <li onClick={() => onOptionSelect('Definir Cambios')}>Establecer Cambios</li>
                                    <li onClick={() => onOptionSelect('Listar Cambios')}>Mostrar Cambios</li>
                                </ul>
                            )}   
                        </>                                                                                                         
                    )}
                </ul>
            </div>

            <div className="sidebar-footer">
                <button onClick={onModalOpen}>Account</button>
            </div>
        </div>
    );
}

export default Sidebar;