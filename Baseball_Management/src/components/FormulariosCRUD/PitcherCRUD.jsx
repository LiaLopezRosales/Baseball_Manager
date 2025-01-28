// Baseball_Management/src/components/FormulariosCRUD/PitcherCRUD.jsx

import React, { useState, useEffect } from "react";
import BaseCRUD from "./BaseCRUD";

const PitcherCRUD = () => {

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

    useEffect(() => {
        fetchPerson();
    }, []);


    const fields = [
        { 
            name: "P_id", 
            label: "Persona", 
            type: "select", 
            nullable: false,
            options: persons.map((person) => ({id: person.id, name: `${person.name} ${person.lastname}`})),
        },
        { 
            name: "dominant_hand", 
            label: "Mano Dominante", 
            type: "select", 
            nullable: false,
            options: [
                { id: "izquierda", name: "Izquierda" },
                { id: "derecha", name: "Derecha" },
            ],
        },
        { name: "No_games_won", label: "Juegos Ganados", type: "number", nullable: false },
        { name: "No_games_lost", label: "Juegos Perdidos", type: "number", nullable: false },
        { name: "running_average", label: "Promedio de Carreras", type: "number", nullable: false },
    ];

    const apiUrl = "http://127.0.0.1:8000/pitchers/";
    const initialFormValues = {
        P_id: "",
        dominant_hand: "",
        No_games_won: "",
        No_games_lost: "",
        running_average: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Lanzadores"
            initialFormValues={initialFormValues}
        />
    );
};
export default PitcherCRUD;


