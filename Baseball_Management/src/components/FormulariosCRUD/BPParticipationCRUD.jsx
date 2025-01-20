// Baseball_Management/src/components/FormulariosCRUD/BPParticipationCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const BPParticipationCRUD = () => {
    const fields = [
        { name: "BP_id", label: "Jugador de Béisbol ID", type: "number", nullable: false },
        { name: "team_id", label: "Equipo ID", type: "number", nullable: false },
        { name: "series", label: "Serie", type: "number", nullable: false },
    ];
    const apiUrl = "http://127.0.0.1:8000/bp-participations/";
    const initialFormValues = {
        BP_id: "",
        team_id: "",
        series: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Participación de Jugadores de Béisbol"
            initialFormValues={initialFormValues}
        />
    );
};
export default BPParticipationCRUD;


