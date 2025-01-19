// Baseball_Management/src/components/BaseCRUD.jsx

import React, {useState} from "react";
import BaseCRUD from "./BaseCRUD";

const UserCRUD = () => {

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const fields = [
    { name: "email", label: "Email", type: "email" },
    { name: "rol_id", label: "Rol ID", type: "number" },
    { name: "TD_id", label: "TD ID", type: "number", nullable: true },
    {
      name: "password",
      label: "Password",
      hidden: true,
      type: "password",
      toggleVisibility: togglePasswordVisibility,
      showPassword,
    },
  ];

  const apiUrl = "http://127.0.0.1:8000/users/";

  const initialFormValues = {
    email: "",
    rol_id: "",
    TD_id: "",
    password: "",
  };

  return (
    <BaseCRUD
      apiUrl={apiUrl}
      fields={fields}
      title="Usuarios"
      initialFormValues={initialFormValues}
    />
  );
};
export default UserCRUD;


