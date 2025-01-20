// Primer modelo hecho funcional

import React, { useState, useEffect } from "react";

const UserCRUD = () => {
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formValues, setFormValues] = useState({
    email: "",
    rol_id: "",
    TD_id: "",
    password: "",
  });

  // Estado para manejar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/users/");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Error fetching users");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormValues({
      email: "",
      rol_id: "",
      TD_id: "",
      password: "",
    });
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    setFormValues({
      email: user.email,
      rol_id: user.rol_id,
      TD_id: user.TD_id || "",
      password: user.password,
    });
  };

  const handleSave = async () => {

    const url = isEditing
      ? `http://127.0.0.1:8000/users/${currentUser.id}/`
      : "http://127.0.0.1:8000/users/";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      if (response.ok) {
        fetchUsers();
        setIsEditing(false);
        setIsCreating(false);
        setCurrentUser(null);
      } else {
        console.error("Error saving user");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/users/${userId}/`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          fetchUsers();
        } else {
          console.error("Error deleting user");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setCurrentUser(null);
  };

  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="user-crud-container">
      <h1>Usuarios</h1>

      {/* Lista de usuarios */}
      <div className="user-list">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Rol ID</th>
              <th>TD ID</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.rol_id}</td>
                <td>{user.TD_id || "N/A"}</td>
                <td>
                  <button onClick={() => handleEdit(user)}>Editar</button>
                  <button onClick={() => handleDelete(user.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botones de acción */}
      <div className="actions">
        <button onClick={fetchUsers}>Actualizar Lista</button>
        <button onClick={handleCreate}>Añadir Usuario</button>
      </div>

      {/* Formulario para crear o editar */}
      {(isCreating || isEditing) && (
        <div className="user-form">
          <h2>{isEditing ? "Editar Usuario" : "Crear Usuario"}</h2>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Rol ID:</label>
            <input
              type="number"
              name="rol_id"
              value={formValues.rol_id}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>TD ID:</label>
            <input
              type="number"
              name="TD_id"
              value={formValues.TD_id}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type={showPassword ? "text" : "password"}  // Aquí cambiamos el tipo del campo
              name="password"
              value={formValues.password}
              onChange={handleInputChange}
            />
            <button type="button" onClick={togglePasswordVisibility}>
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <div className="form-actions">
            <button onClick={handleSave}>Guardar</button>
            <button onClick={handleCancel}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCRUD;
