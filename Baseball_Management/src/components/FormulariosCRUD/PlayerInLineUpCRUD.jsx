// Baseball_Management/src/components/FormulariosCRUD/PlayerInLineUpCRUD.jsx

import React, { useState, useEffect } from "react";
import BaseCRUD from "./BaseCRUD";

const PlayerInLineUpCRUD = () => {
    
    const [lineups, setLineups] = useState([]);
    const [playerInPositions, setPlayerInPositions] = useState([]);

    // Obtener las alineaciones
    const fetchLineups = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/lineups/");
            if (response.ok) {
                const lineupData = await response.json();
                const teamsNames = await Promise.all(
                    lineupData.map(async (lineup) => {
                        const teamsResponse = await fetch(`http://127.0.0.1:8000/teams/${lineup.team_id}/`);
                        if (teamsResponse.ok) {
                            const team = await teamsResponse.json();
                            return { id: lineup.id, name: `${team.name} - ${lineup.id}`};
                        }
                    })
                );
                setLineups(teamsNames);
            };
        } catch (error) {
            console.error("Error fetching lineups:", error);
        }
    };

    // Obtener los jugadores en posición
    const fetchPlayerInPositions = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/players-in-position/");
            if (response.ok) {
                const data = await response.json();
                const playersWithNames = await Promise.all(
                    data.map(async (player) => {
                        const playerResponse = await fetch(`http://127.0.0.1:8000/baseball-players/${player.BP_id}/`);
                        if (playerResponse.ok) {
                            const baseballPlayer = await playerResponse.json();
                            const personResponse = await fetch(`http://127.0.0.1:8000/persons/${baseballPlayer.P_id}/`);
                            if (personResponse.ok) {
                                const person = await personResponse.json();
                                return { id: player.id, name: `${person.name} ${person.lastname}` };
                            }
                        }
                        return { id: player.id, name: "Unknown" };
                    })
                );
                setPlayerInPositions(playersWithNames);
            }
        } catch (error) {
            console.error("Error fetching players in position:", error);
        }
    };

    useEffect(() => {
        fetchLineups();
        fetchPlayerInPositions();
    }, []);

    const fields = [
        { 
            name: "line_up", 
            label: "Alineación", 
            type: "select", 
            options: lineups, 
            nullable: false 
        },
        { 
            name: "player_in_position", 
            label: "Jugador en Posición", 
            type: "select", 
            options: playerInPositions, 
            nullable: false 
        },
    ];

    const apiUrl = "http://127.0.0.1:8000/players-in-lineup/";
    const initialFormValues = {
        line_up: "",
        player_in_position: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Jugadores en Alineación"
            initialFormValues={initialFormValues}
        />
    );
};

export default PlayerInLineUpCRUD;


