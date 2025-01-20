// Baseball_Management/src/components/FormulariosCRUD/StarPlayerCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const StarPlayerCRUD = () => {
    const fields = [
        { name: "BP_id", label: "Jugador ID", type: "number", nullable: false },
        { name: "series", label: "Series", type: "number", nullable: false },
        { name: "position", label: "Posición", type: "text", nullable: false },
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


