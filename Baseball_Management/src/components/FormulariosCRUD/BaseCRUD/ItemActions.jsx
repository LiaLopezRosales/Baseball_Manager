import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

const ItemActions = ({ item, onView, onEdit, onDelete }) => (
  <div className="bc-actions-group">
    {onView && (
      <button
        className="bc-action-btn bc-action-btn--view"
        onClick={() => onView(item)}
        title="Ver ficha completa"
        aria-label="Ver ficha completa"
      >
        <Eye size={16} />
      </button>
    )}
    <button
      className="bc-action-btn bc-action-btn--edit"
      onClick={() => onEdit(item)}
      title="Editar"
      aria-label="Editar"
    >
      <Pencil size={16} />
    </button>
    <button
      className="bc-action-btn bc-action-btn--delete"
      onClick={() => onDelete(item.id)}
      title="Eliminar"
      aria-label="Eliminar"
    >
      <Trash2 size={16} />
    </button>
  </div>
);

export default ItemActions;