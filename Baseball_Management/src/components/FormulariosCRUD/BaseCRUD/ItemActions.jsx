import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const ItemActions = ({ item, onEdit, onDelete }) => (
  <div className="dt-actions-group">
    <button
      className="dt-action-btn dt-action-btn--edit"
      onClick={() => onEdit(item)}
      title="Editar"
      aria-label="Editar"
    >
      <Pencil size={16} />
    </button>
    <button
      className="dt-action-btn dt-action-btn--delete"
      onClick={() => onDelete(item.id)}
      title="Eliminar"
      aria-label="Eliminar"
    >
      <Trash2 size={16} />
    </button>
  </div>
);

export default ItemActions;
