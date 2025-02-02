// Baseball_Management/src/components/FormulariosCRUD/PlayerSwapCRUD.jsx

import React, { useState, useEffect } from "react";
import BaseCRUD from "./BaseCRUD";

const PlayerSwapCRUD = () => {
    
    const [baseballPlayers, setBaseballPlayers] = useState([]);
    const [positions, setPositions] = useState([]);
    const [gameTeams, setGameTeams] = useState([]);

    // Obtener los jugadores de béisbol
    const fetchBaseballPlayers = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/baseball-players/");
            if (response.ok) {
                const data = await response.json();
                const playersWithNames = await Promise.all(
                    data.map(async (player) => {
                        const personResponse = await fetch(`http://127.0.0.1:8000/persons/${player.P_id}/`);
                        if (personResponse.ok) {
                            const person = await personResponse.json();
                            return { id: player.id, name: `${person.name} ${person.lastname}` };
                        }
                        return { id: player.id, name: "Desconocido" };
                    })
                );
                setBaseballPlayers(playersWithNames);
            }
        } catch (error) {
            console.error("Error obteniendo jugadores:", error);
        }
    };

    // Obtener las posiciones
    const fetchPositions = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/positions/");
            if (response.ok) {
                const data = await response.json();
                setPositions(data.map(poss => ({ id: poss.id, name: `${poss.name} - ${poss.id}` })));
            }
        } catch (error) {
            console.error("Error obteniendo equipos:", error);
        }
    };

    // Obtener los equipos en juego
    const fetchGameTeams = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/teams-on-field/");
            if (response.ok) {
                const gameTeamsData = await response.json();
                const teamsWithName = await Promise.all(
                    gameTeamsData.map(async (teams) => {
                        const lineUpResponse = await fetch(`http://127.0.0.1:8000/lineups/${teams.lineup_id}`); 
                        if (lineUpResponse.ok) {
                            const lineups = await lineUpResponse.json();
                            const teamsResponse = await fetch(`http://127.0.0.1:8000/teams/${lineups.team_id}/`);
                                if (teamsResponse.ok) {
                                    const team = await teamsResponse.json();
                                    return { id: teams.id, name: `${team.name} - Equipo en el campo # ${teams.id}`};
                                }
                            }
                            return { id: teams.id, name: "Desconocidos" };
                        })
                    );
                    setGameTeams(teamsWithName);
                }
        } catch (error) {
            console.error("Error obteniendo equipos en el campo:", error);
        }
    };

    useEffect(() => {
        fetchBaseballPlayers();
        fetchPositions();
        fetchGameTeams();
    }, []);
    
    const fields = [
        { 
            name: "game_team", 
            label: "Equipo en Juego", 
            type: "select", 
            options: gameTeams,
            nullable: false,
        },
        { 
            name: "old_player", 
            label: "Jugador Anterior", 
            type: "select", 
            options: baseballPlayers,
            nullable: false,
        },
        { 
            name: "new_player", 
            label: "Jugador Entrante", 
            type: "select", 
            options: baseballPlayers,
            nullable: false,
        },
        { 
            name: "date", 
            label: "Fecha", 
            type: "date", 
            nullable: false, 
        },
        { 
            name: "position", 
            label: "Posición", 
            type: "select", 
            options: positions,
            nullable: false, 
        },
    ];
    
    const apiUrl = "http://127.0.0.1:8000/player-swaps/";
    const initialFormValues = {
        game_team: "",
        old_player: "",
        new_player: "",
        date: "",
        position: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Cambios de Jugador"
            initialFormValues={initialFormValues}
        />
    );
};
export default PlayerSwapCRUD;


