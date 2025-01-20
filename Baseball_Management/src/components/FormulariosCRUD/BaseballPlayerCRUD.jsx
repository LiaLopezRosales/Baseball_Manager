// Baseball_Management/src/components/FormulariosCRUD/BaseballPlayerCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const BaseballPlayerCRUD = () => {
    const fields = [
        { name: "id", label: "ID", type: "number"},
        { name: "CI", label: "CI", type: "number", nullable: false },
        { name: "batting_average", label: "Promedio de Bateo", type: "number", nullable: false },
        { name: "years_of_experience", label: "Años de Experiencia", type: "number", nullable: false },
        { name: "pitcher", label: "Lanzador ID", type: "number", nullable: true },
    ];
    const apiUrl = "http://127.0.0.1:8000/baseball-players/";
    const initialFormValues = {
        id: "",
        CI: "",
        batting_average: "",
        years_of_experience: "",
        pitcher: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Jugadores de Béisbol"
            initialFormValues={initialFormValues}
        />
    );
};
export default BaseballPlayerCRUD;


