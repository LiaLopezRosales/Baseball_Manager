// Baseball_Management/src/components/FormulariosCRUD/WorkerCRUD.jsx

import React, { useState, useEffect } from "react";
import BaseCRUD from "./BaseCRUD";

const WorkerCRUD = () => {

    const [technicalDirectors, setTechnicalDirectors] = useState([]); // Para almacenar los directores técnicos
    const [persons, setPerson] = useState([]);

    // Función para obtener los nombres de las personas
    const fetchPerson = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/persons/");
            if (response.ok) {
                const data = await response.json();
                setPerson(data);
            }
        } catch (error) {
            console.error("Error obteniendo personas", error);
        }
    }

    // Función para obtener los directores técnicos
    const fetchTechnicalDirectors = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/technical-directors/");
            if (response.ok) {
                const technicalDirectorsData = await response.json();
                const directorsWithNames = await Promise.all(
                    technicalDirectorsData.map(async (td) => {
                        const workerResponse = await fetch(`http://127.0.0.1:8000/workers/${td.W_id}/`);
                        if (workerResponse.ok) {
                            const worker = await workerResponse.json();
                            const personResponse = await fetch(`http://127.0.0.1:8000/persons/${worker.P_id}/`);
                            if (personResponse.ok) {
                                const person = await personResponse.json();
                                return { id: td.id, name: `${person.name} ${person.lastname}` };
                            }
                        }
                        return { id: td.id, name: "Desconocido" };
                    })
                );
                setTechnicalDirectors(directorsWithNames);
            }
        } catch (error) {
            console.error("Error obteniendo directores técnicos:", error);
        }
    };

    useEffect(() => {
        fetchPerson();
        fetchTechnicalDirectors();
    }, []);

    const fields = [
        { 
            name: "P_id", 
            label: "Persona ID", 
            type: "select", 
            nullable: false,
            options: persons.map((person) => ({id: person.id, name: `${person.name} ${person.lastname}`})),
        },
        {
            name: "TD_id",
            label: "Director Técnico",
            type: "select",
            options: technicalDirectors,
            nullable: true,
        },
    ];

    const apiUrl = "http://127.0.0.1:8000/workers/";
    const initialFormValues = {
        P_id: "",
        DT_id: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Trabajadores"
            initialFormValues={initialFormValues}
        />
    );
};
export default WorkerCRUD;

