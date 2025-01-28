// Baseball_Management/src/components/FormulariosCRUD/BaseCRUD/ItemActions.jsx

import React from "react";

const ItemActions = ({ item, onEdit, onDelete }) => (
  <div>
    <button onClick={() => onEdit(item)}>Editar</button>
    <button onClick={() => onDelete(item.id)}>Eliminar</button>
  </div>
);

export default ItemActions;
