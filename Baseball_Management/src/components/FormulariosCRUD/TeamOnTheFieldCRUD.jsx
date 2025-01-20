// Baseball_Management/src/components/FormulariosCRUD/TeamOnTheFieldCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const TeamOnTheFieldCRUD = () => {
    const fields = [
        { name: "id", label: "ID", type: "number", nullable: false },
        { name: "lineup_id", label: "Alineación ID", type: "number", nullable: false },
    ];
    const apiUrl = "http://127.0.0.1:8000/teams-on-field/";
    const initialFormValues = {
        id: "",
        lineup_id: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Equipos en el Campo"
            initialFormValues={initialFormValues}
        />
    );
};
export default TeamOnTheFieldCRUD;

