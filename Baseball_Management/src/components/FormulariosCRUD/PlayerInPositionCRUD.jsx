// Baseball_Management/src/components/FormulariosCRUD/PlayerInPositionCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const PlayerInPositionCRUD = () => {
    const fields = [
        { name: "BP_id", label: "Jugador ID", type: "number", nullable: false },
        { name: "position", label: "Posición", type: "number", nullable: false },
        { name: "effectiveness", label: "Efectividad", type: "number", nullable: false },
    ];
    const apiUrl = "http://127.0.0.1:8000/players-in-position/";
    const initialFormValues = {
        BP_id: "",
        position: "",
        effectiveness: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Jugadores en Posición"
            initialFormValues={initialFormValues}
        />
    );
};
export default PlayerInPositionCRUD;


