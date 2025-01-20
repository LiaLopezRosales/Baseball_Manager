// Baseball_Management/src/components/FormulariosCRUD/TechnicalDirectorCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const TechnicalDirectorCRUD = () => {
    const fields = [
        { name: "direction_team", label: "Equipo de Dirección ID", type: "number", nullable: true },
        { name: "W_id", label: "Trabajador ID", type: "number", nullable: false },
    ];
    
    const apiUrl = "http://127.0.0.1:8000/technical-directors/";
    
    const initialFormValues = {
        direction_team: "",
        W_id: "",
    };
  
    return (
        <BaseCRUD
            apiUrl={apiUrl}
            fields={fields}
            title="Directores Técnicos"
            initialFormValues={initialFormValues}
        />
    );
  };
  
  export default TechnicalDirectorCRUD;

  