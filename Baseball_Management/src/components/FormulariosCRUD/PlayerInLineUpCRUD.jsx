// Baseball_Management/src/components/FormulariosCRUD/PlayerInLineUpCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const PlayerInLineUpCRUD = () => {
    const fields = [
        { name: "line_up", label: "Alineación", type: "number", nullable: false },
        { name: "player_in_position", label: "Jugador en Posición", type: "number", nullable: false },
    ];
    const apiUrl = "http://127.0.0.1:8000/players-in-lineup/";
    const initialFormValues = {
        lineup_id: "",
        player_in_position: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Jugadores en Alineación"
            initialFormValues={initialFormValues}
        />
    );
};
export default PlayerInLineUpCRUD;


