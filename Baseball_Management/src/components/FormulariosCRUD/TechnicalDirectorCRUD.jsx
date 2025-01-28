// Baseball_Management/src/components/FormulariosCRUD/TechnicalDirectorCRUD.jsx

import React, { useState, useEffect } from "react";
import BaseCRUD from "./BaseCRUD";

const TechnicalDirectorCRUD = () => {
    const [directionTeams, setDirectionTeams] = useState([]);
    const [workers, setWorkers] = useState([]);

    // Obtener los equipos de dirección
    const fetchDirectionTeams = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/direction-teams/");
            if (response.ok) {
                const tdData = await response.json();
                const teamsNames = await Promise.all(
                    tdData.map(async (td) => {
                        const teamsResponse = await fetch(`http://127.0.0.1:8000/teams/${td.Team_id}/`);
                        if (teamsResponse.ok) {
                            const team = await teamsResponse.json();
                            return { id: td.id, name: `${team.name} - ${td.id}`};
                        }
                    })
                );
                setDirectionTeams(teamsNames);
            }
        } catch (error) {
            console.error("Error fetching direction teams:", error);
        }
    };

    // Obtener los trabajadores
    const fetchWorkers = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/workers/");
            if (response.ok) {
                const data = await response.json();
                const workersWithNames = await Promise.all(
                    data.map(async (worker) => {
                        const personResponse = await fetch(`http://127.0.0.1:8000/persons/${worker.P_id}/`);
                        if (personResponse.ok) {
                            const person = await personResponse.json();
                            return { id: worker.id, name: `${person.name} ${person.lastname}` };
                        }
                        return { id: worker.id, name: "Unknown" };
                    })
                );
                setWorkers(workersWithNames);
            }
        } catch (error) {
            console.error("Error fetching workers:", error);
        }
    };

    useEffect(() => {
        fetchDirectionTeams();
        fetchWorkers();
    }, []);

    const fields = [
        { name: "direction_team", label: "Equipo de Dirección", type: "select", options: directionTeams, nullable: true },
        { name: "W_id", label: "Trabajador", type: "select", options: workers, nullable: false },
    ];

    const apiUrl = "http://127.0.0.1:8000/technical-directors/";
    const initialFormValues = {
        direction_team: "",
        W_id: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Directores Técnicos"
            initialFormValues={initialFormValues}
        />
    );
};

export default TechnicalDirectorCRUD;



