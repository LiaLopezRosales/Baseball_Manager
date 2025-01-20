// Baseball_Management/src/components/FormulariosCRUD/ScoreCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const ScoreCRUD = () => {
    const fields = [
        { name: "id", label: "ID", type: "number", nullable: false },
        { name: "winner", label: "Ganador", type: "number", nullable: false },
        { name: "loser", label: "Perdedor", type: "number", nullable: false },
        { name: "w_points", label: "Puntos del Ganador", type: "number", nullable: false },
        { name: "l_points", label: "Puntos del Perdedor", type: "number", nullable: false },
    ];
    const apiUrl = "http://127.0.0.1:8000/scores/";
    const initialFormValues = {
        id: "",
        winner: "",
        loser: "",
        w_points: "",
        l_points: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Marcadores"
            initialFormValues={initialFormValues}
        />
    );
};
export default ScoreCRUD;


