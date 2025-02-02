import React from "react";

const ItemActions = ({ item, onEdit, onDelete }) => (
  <div className="item-actions">
    <button 
      onClick={() => onEdit(item)}
      className="edit-button"
    >
      Editar
    </button>
    <button 
      onClick={() => onDelete(item.id)}
      className="delete-button"
    >
      Eliminar
    </button>
  </div>
);

export default ItemActions;