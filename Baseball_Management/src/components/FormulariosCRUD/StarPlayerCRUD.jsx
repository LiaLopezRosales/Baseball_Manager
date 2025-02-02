// Baseball_Management/src/components/FormulariosCRUD/StarPlayerCRUD.jsx

import React, { useState, useEffect } from "react";
import BaseCRUD from "./BaseCRUD";

const StarPlayerCRUD = () => {
    
    const [baseballPlayers, setBaseballPlayers] = useState([]);
    const [positions, setPositions] = useState([]);
    const [seriesList, setSeriesList] = useState([]);

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

    // Obtener las series
    const fetchSeries = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/series/");
            if (response.ok) {
                const data = await response.json();
                setSeriesList(data.map(series => ({ id: series.id, name: `${series.name} (${series.type}) en Temporada ${series.season}` })));
            }
        } catch (error) {
            console.error("Error obteniendo series:", error);
        }
    };

    useEffect(() => {
        fetchBaseballPlayers();
        fetchPositions();
        fetchSeries();
    }, []);

    
    
    
    const fields = [
        { 
            name: "BP_id", 
            label: "Jugador de Béisbol", 
            type: "select", 
            options: baseballPlayers 
        },
        { 
            name: "series", 
            label: "Serie", 
            type: "select", 
            options: seriesList 
        },
        { 
            name: "position", 
            label: "Posición", 
            type: "select", 
            options: positions,
            nullable: false 
        },
    ];

    const apiUrl = "http://127.0.0.1:8000/star-players/";
    const initialFormValues = {
        BP_id: "",
        series: "",
        position: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Jugadores Estrella"
            initialFormValues={initialFormValues}
        />
    );
};
export default StarPlayerCRUD;


