// Baseball_Management/src/components/FormulariosCRUD/SeriesCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const SeriesCRUD = () => {
    const fields = [
        { name: "name", label: "Nombre", type: "text", nullable: false },
        { name: "type", label: "Tipo de Serie", type: "text", nullable: false },
        { name: "season", label: "Temporada", type: "number", nullable: false },
        { name: "init_date", label: "Fecha de Inicio", type: "date"},
        { name: "end_date", label: "Fecha de Final", type: "date"},
    ];
    const apiUrl = "http://127.0.0.1:8000/series/";
    const initialFormValues = {
        season: "",
        name: "",
        type: "",
        init_date: "",
        end_date: "",
    };

    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Series"
            initialFormValues={initialFormValues}
        />
    );
};
export default SeriesCRUD;


