// Baseball_Management/src/components/FormulariosCRUD/PositionCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const PositionCRUD = () => {
    const fields = [
        { name: "id", label: "ID", type: "number"},
        { name: "name", label: "Nombre", type: "text", nullable: false },
    ];
    const apiUrl = "http://127.0.0.1:8000/positions/";
    const initialFormValues = {
        id: "",
        name: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Posiciones"
            initialFormValues={initialFormValues}
        />
    );
};
export default PositionCRUD;


