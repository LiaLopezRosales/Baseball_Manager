// Baseball_Management/src/components/FormulariosCRUD/TeamCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const TeamCRUD = () => {
    const fields = [
        { name: "id", label: "ID", type: "number"},
        { name: "name", label: "Nombre", type: "text", nullable: false },
        { name: "color", label: "Color", type: "text", nullable: false },
        { name: "initials", label: "Iniciales", type: "text", nullable: false },
        { name: "representative_entity", label: "Entidad Representativa", type: "text", nullable: false },
    ];
    const apiUrl = "http://127.0.0.1:8000/teams/";
    const initialFormValues = {
        id: "",
        name: "",
        color: "",
        initials: "",
        representative_entity: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Equipos"
            initialFormValues={initialFormValues}
        />
    );
};
export default TeamCRUD;

