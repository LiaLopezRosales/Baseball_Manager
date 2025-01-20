// Baseball_Management/src/components/FormulariosCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const LineUpCRUD = () => {
    const fields = [
        { name: "id", label: "ID", type: "number", nullable: false },
        { name: "team_id", label: "Equipo ID", type: "number", nullable: false },
    ];
    const apiUrl = "http://127.0.0.1:8000/lineups/";
    const initialFormValues = {
        id: "",
        team_id: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Alineaciones"
            initialFormValues={initialFormValues}
        />
    );
};
export default LineUpCRUD;


