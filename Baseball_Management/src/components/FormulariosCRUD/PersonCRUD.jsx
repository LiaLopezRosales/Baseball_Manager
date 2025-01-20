// Baseball_Management/src/components/FormulariosCRUD/PersonCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const PersonCRUD = () => {
    const fields = [
        { name: "CI", label: "CI", type: "number", nullable: false },
        { name: "age", label: "Edad", type: "number", nullable: false },
        { name: "name", label: "Nombre", type: "text", nullable: false },
        { name: "lastname", label: "Apellido", type: "text", nullable: false },
    ];
    const apiUrl = "http://127.0.0.1:8000/persons/";
    const initialFormValues = {
        CI: "",
        age: "",
        name: "",
        lastname: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Personas"
            initialFormValues={initialFormValues}
        />
    );
};
export default PersonCRUD;


