// Baseball_Management/src/components/FormulariosCRUD/BaseCRUD/ItemActions.jsx

import React from "react";

const ItemActions = ({ item, onEdit, onDelete }) => (
  <div>
    <button className="edit-button" onClick={() => onEdit(item)}>Editar</button>
    <button className="delete-button" onClick={() => onDelete(item.id)}>Eliminar</button>
  </div>
);

export default ItemActions;
