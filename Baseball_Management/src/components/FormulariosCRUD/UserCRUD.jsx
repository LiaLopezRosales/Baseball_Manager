// Baseball_Management/src/components/FormulariosCRUD/UserCRUD.jsx

import React, { useState, useEffect } from "react";
import BaseCRUD from "./BaseCRUD";

const UserCRUD = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [roles, setRoles] = useState([]); // Para almacenar los roles
    const [technicalDirectors, setTechnicalDirectors] = useState([]); // Para almacenar los directores técnicos

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Función para obtener los roles
    const fetchRoles = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/roles/");
            if (response.ok) {
                const data = await response.json();
                setRoles(data);
            }
        } catch (error) {
            console.error("Error obteniendo roles:", error);
        }
    };

    // Función para obtener los directores técnicos
    const fetchTechnicalDirectors = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/technical-directors/");
            if (response.ok) {
                const technicalDirectorsData = await response.json();
                const directorsWithNames = await Promise.all(
                    technicalDirectorsData.map(async (td) => {
                        const workerResponse = await fetch(`http://127.0.0.1:8000/workers/${td.W_id}/`);
                        if (workerResponse.ok) {
                            const worker = await workerResponse.json();
                            const personResponse = await fetch(`http://127.0.0.1:8000/persons/${worker.P_id}/`);
                            if (personResponse.ok) {
                                const person = await personResponse.json();
                                return { id: td.id, name: `${person.name} ${person.lastname}` };
                            }
                        }
                        return { id: td.id, name: "Desconocido" };
                    })
                );
                setTechnicalDirectors(directorsWithNames);
            }
        } catch (error) {
            console.error("Error obteniendo directores técnicos:", error);
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchTechnicalDirectors();
    }, []);

    const fields = [
        { name: "id", label: "ID", type: "number", autoGenerated: true },
        { name: "email", label: "Email", type: "email" },
        {
            name: "rol_id",
            label: "Rol",
            type: "select",
            options: roles.map((role) => ({ id: role.id, name: role.type })),
        },
        {
            name: "TD_id",
            label: "Director Técnico",
            type: "select",
            options: technicalDirectors,
            nullable: true,
        },
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
        id: "",
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

