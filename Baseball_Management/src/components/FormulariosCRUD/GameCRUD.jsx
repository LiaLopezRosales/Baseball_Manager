// Baseball_Management/src/components/FormulariosCRUD/GameCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const GameCRUD = () => {
    const fields = [
        { name: "date", label: "Fecha", type: "date", nullable: false },
        { name: "local", label: "Equipo Local", type: "number", nullable: false },
        { name: "rival", label: "Equipo Rival", type: "number", nullable: false },
        { name: "series", label: "Series", type: "number", nullable: false },
        { name: "score", label: "Marcador", type: "number", nullable: false },    
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


