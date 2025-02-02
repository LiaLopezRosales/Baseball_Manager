// Baseball_Management/src/components/FormulariosCRUD/PlayerInPositionCRUD.jsx

import React, { useState, useEffect } from "react";
import BaseCRUD from "./BaseCRUD";

const PlayerInPositionCRUD = () => {

    const [baseballPlayers, setBaseballPlayers] = useState([]);
    const [positions, setPositions] = useState([]);

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
                setPositions(data.map(poss => ({ id: poss.id, name: poss.name })));
            }
        } catch (error) {
            console.error("Error obteniendo equipos:", error);
        }
    };

    useEffect(() => {
        fetchBaseballPlayers();
        fetchPositions();
    }, []);

    const fields = [
        { 
            name: "BP_id", 
            label: "Jugador de Béisbol", 
            type: "select", 
            options: baseballPlayers 
        },
        { 
            name: "position", 
            label: "Posición", 
            type: "select", 
            options: positions,
            nullable: false 
        },
        { name: "effectiveness", label: "Efectividad", type: "number", nullable: false },
    ];

    const apiUrl = "http://127.0.0.1:8000/players-in-position/";
    const initialFormValues = {
        BP_id: "",
        position: "",
        effectiveness: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Jugadores en Posición"
            initialFormValues={initialFormValues}
        />
    );
};
export default PlayerInPositionCRUD;


