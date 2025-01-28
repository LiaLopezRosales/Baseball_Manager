// Baseball_Management/src/components/FormulariosCRUD/BPParticipationCRUD.jsx

import React, { useState, useEffect } from "react";
import BaseCRUD from "./BaseCRUD";

const BPParticipationCRUD = () => {
    
    const [baseballPlayers, setBaseballPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
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
                        return { id: player.id, name: "Unknown" };
                    })
                );
                setBaseballPlayers(playersWithNames);
            }
        } catch (error) {
            console.error("Error fetching baseball players:", error);
        }
    };

    // Obtener los equipos
    const fetchTeams = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/teams/");
            if (response.ok) {
                const data = await response.json();
                setTeams(data.map(team => ({ id: team.id, name: team.name })));
            }
        } catch (error) {
            console.error("Error fetching teams:", error);
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
            console.error("Error fetching series:", error);
        }
    };

    useEffect(() => {
        fetchBaseballPlayers();
        fetchTeams();
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
            name: "team_id", 
            label: "Equipo", 
            type: "select", 
            options: teams 
        },
        { 
            name: "series", 
            label: "Serie", 
            type: "select", 
            options: seriesList 
        },
    ];

    const apiUrl = "http://127.0.0.1:8000/bp-participations/";
    const initialFormValues = {
        BP_id: "",
        team_id: "",
        series: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Participación de Jugadores"
            initialFormValues={initialFormValues}
        />
    );
};

export default BPParticipationCRUD;