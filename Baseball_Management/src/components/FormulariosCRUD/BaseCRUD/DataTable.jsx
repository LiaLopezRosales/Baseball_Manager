import React, { useState } from "react";
import ItemActions from "./ItemActions";

const DataTable = ({ data, fields, sortConfig, onSort, onEdit, onDelete, onFilter }) => {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (field, value, filterType) => {
    const newFilters = { ...filters, [field]: { ...filters[field], [filterType]: value } };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const isFieldVisible = (field) => {
    return !field.hidden && field.type !== "password";
  };

  return (
    <div className="item-list">
      <table>
        <thead>
          {/* Fila de Filtros */}
          <tr>
            {fields.filter(isFieldVisible).map((field) => (
              <th key={`${field.name}-filter`}>
                {field.type === "number" && (
                  <>
                    <input type="number" placeholder="Min" onChange={(e) => handleFilterChange(field.name, e.target.value, 'min')} />
                    <input type="number" placeholder="Max" onChange={(e) => handleFilterChange(field.name, e.target.value, 'max')} />
                  </>
                )}
                {field.type === "date" && (
                  <>
                    <input type="date" placeholder="Inicio" onChange={(e) => handleFilterChange(field.name, e.target.value, 'start')} />
                    <input type="date" placeholder="Final" onChange={(e) => handleFilterChange(field.name, e.target.value, 'end')} />
                  </>
                )}
                {field.type === "text" && (
                  <input type="text" placeholder="Buscar" onChange={(e) => handleFilterChange(field.name, e.target.value, 'search')} />
                )}
                {field.type === "email" && (
                  <input type="text" placeholder="Buscar" onChange={(e) => handleFilterChange(field.name, e.target.value, 'search')} />
                )}
              </th>
            ))}
            <th></th> {/* Celda vacía para las acciones */}
          </tr>

          <tr>
            {fields.filter(isFieldVisible).map((field) => (
              <th key={field.name}>
                {field.label}
                <button onClick={() => onSort(field.name)}>
                  {sortConfig.key === field.name
                    ? sortConfig.direction === "ascending"
                      ? "🔼"
                      : "🔽"
                    : null}
                </button>
              </th>
            ))}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {fields.filter(isFieldVisible).map((field) => (
                <td key={field.name}>{item[field.name] || "N/A"}</td>
              ))}
              <td>
                <ItemActions item={item} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
