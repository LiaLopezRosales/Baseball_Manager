// Baseball_Management/src/components/FormulariosCRUD.jsx

import React from "react";
import BaseCRUD from "./BaseCRUD";

const RolCRUD = () => {
    const fields = [
        { name: "id", label: "ID", type: "number"},
        { name: "type", lable: "Tipo", type: "text"},
    ];
    const apiUrl = "http://127.0.0.1:8000/roles/";
    const initialFormValues = {
        id : "",
        type: "",
    };
    return (
        <BaseCRUD
          apiUrl={apiUrl}
          fields={fields}
          title="Roles"
          initialFormValues={initialFormValues}
        />
    );
};
export default RolCRUD;

