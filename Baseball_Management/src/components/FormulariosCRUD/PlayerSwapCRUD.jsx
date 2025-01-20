// Baseball_Management/src/components/FormulariosCRUD/PlayerSwapCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const PlayerSwapCRUD = () => {
    const fields = [
        { name: "game_team", label: "Equipo en Juego", type: "number", nullable: false },
        { name: "old_player", label: "Jugador Anterior", type: "number", nullable: false },
        { name: "new_player", label: "Jugador Entrante", type: "number", nullable: false },
        { name: "date", label: "Fecha", type: "date", nullable: false },
        { name: "position", label: "Posición", type: "number", nullable: false },
    ];
    const apiUrl = "http://127.0.0.1:8000/player-swaps/";
    const initialFormValues = {
        game_team: "",
        old_player: "",
        new_player: "",
        date: "",
        position: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Cambios de Jugador"
            initialFormValues={initialFormValues}
        />
    );
};
export default PlayerSwapCRUD;


