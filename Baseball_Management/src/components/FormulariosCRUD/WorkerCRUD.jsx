// Baseball_Management/src/components/FormulariosCRUD/WorkerCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const WorkerCRUD = () => {
    const fields = [
        { name: "P_id", label: "Person ID", type: "number", nullable: false },
        { name: "DT_id", label: "Director Técnico ID", type: "number", nullable: true },
    ];
    const apiUrl = "http://127.0.0.1:8000/workers/";
    const initialFormValues = {
        P_id: "",
        DT_id: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Trabajadores"
            initialFormValues={initialFormValues}
        />
    );
};
export default WorkerCRUD;

