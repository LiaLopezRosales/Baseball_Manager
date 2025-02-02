// Baseball_Management/src/components/FormulariosCRUD/GameCRUD.jsx
import React, { useState, useEffect } from "react";
import BaseCRUD from "./BaseCRUD";

const GameCRUD = () => {
    
    const [teams, setTeams] = useState([]);
    const [seriesList, setSeriesList] = useState([]);
    const [scores, setScores] = useState([]);

    // Obtener los equipos
    const fetchTeams = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/teams/");
            if (response.ok) {
                const data = await response.json();
                setTeams(data.map(team => ({ id: team.id, name: team.name })));
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

    // Obtener los marcadores
    const fetchScores = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/scores/");
            if (response.ok) {
                const data = await response.json();
                setScores(data.map(score => ({ id: score.id, name: `Score ${score.id}` })));
            }
        } catch (error) {
            console.error("Error obteniendo marcadores:", error);
        }
    };

    useEffect(() => {
        fetchTeams();
        fetchSeries();
        fetchScores();
    }, []);

    const fields = [
        { name: "date", label: "Fecha", type: "date", nullable: false },
        { 
            name: "local", 
            label: "Equipo Local", 
            type: "select", 
            options: teams 
        },
        { 
            name: "rival", 
            label: "Equipo Rival", 
            type: "select", 
            options: teams 
        },
        { 
            name: "series", 
            label: "Serie", 
            type: "select", 
            options: seriesList 
        },
        { 
            name: "score", 
            label: "Marcador", 
            type: "select", 
            options: scores 
        },
    ];

    const apiUrl = "http://127.0.0.1:8000/games/";
    const initialFormValues = {
        date: "",
        local: "",
        rival: "",
        series: "",
        score: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Juegos"
            initialFormValues={initialFormValues}
        />
    );
};

export default GameCRUD;
