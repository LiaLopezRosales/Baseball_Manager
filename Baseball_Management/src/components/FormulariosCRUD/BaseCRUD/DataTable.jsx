import React, { useState } from "react";
import ItemActions from "./ItemActions"; // Importa el componente ItemActions

// Componente DataTable
const DataTable = ({ data, fields, sortConfig, onSort, onEdit, onDelete, onFilter }) => {
  const [filters, setFilters] = useState({});

  // Función para manejar cambios en los filtros
  const handleFilterChange = (field, value, filterType) => {
    const newFilters = { ...filters, [field]: { ...filters[field], [filterType]: value } };
    setFilters(newFilters); // Actualiza el estado de los filtros
    onFilter(newFilters); // Llama a la función onFilter pasada como prop
  };

  // Función para determinar si un campo debe ser visible
  const isFieldVisible = (field) => {
    return !field.hidden && field.type !== "password"; // Oculta campos marcados como hidden o de tipo password
  };

  // Función para formatear números
  const formatNumber = (value) => {
    if (typeof value === 'number') {
      // Si el número es entero, lo devuelve sin decimales
      if (Number.isInteger(value)) {
        return value.toString();
      } else {
        // Si el número tiene decimales, lo limita a 3 decimales
        return value.toFixed(3);
      }
    }
    return value; // Devuelve el valor original si no es un número
  };

  // Función para formatear fechas según la configuración regional del navegador
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // Si no hay fecha, devuelve "N/A"
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A"; // Si la fecha no es válida, devuelve "N/A"

    // Usa Intl.DateTimeFormat para formatear la fecha según la configuración regional
    const formatter = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date); // Formato dependiente de la configuración regional
  };

  // Función para obtener el nombre de la persona a partir del P_id
  const getPersonName = (P_id, field) => {
    if (!field.options) return "N/A"; // Si no hay opciones, devuelve "N/A"
    const person = field.options.find((option) => option.id === P_id);
    return person ? person.name : "N/A"; // Devuelve el nombre de la persona o "N/A" si no se encuentra
  };

  // Función para aplicar el filtro de búsqueda en campos de tipo string
  const applyStringFilter = (item, field, filterValue) => {
    if (field.name === "P_id") {
      // Si el campo es P_id, busca en el nombre de la persona
      const personName = getPersonName(item[field.name], field).toLowerCase();
      return personName.includes(filterValue.toLowerCase());
    } else {
      // Para otros campos de tipo string, busca directamente en el valor
      const fieldValue = item[field.name] ? item[field.name].toString().toLowerCase() : "";
      return fieldValue.includes(filterValue.toLowerCase());
    }
  };

  // Función para filtrar los datos según los filtros aplicados
  const filterData = (data) => {
    return data.filter((item) => {
      return Object.keys(filters).every((fieldName) => {
        const field = fields.find((f) => f.name === fieldName);
        if (!field) return true; // Si el campo no existe, no se aplica filtro

        const filter = filters[fieldName];
        if (field.type === "number") {
          // Filtro para campos numéricos
          const value = item[fieldName];
          return (
            (!filter.min || value >= parseFloat(filter.min)) &&
            (!filter.max || value <= parseFloat(filter.max))
          );
        } else if (field.type === "date") {
          // Filtro para campos de fecha
          const date = new Date(item[fieldName]);
          return (
            (!filter.start || date >= new Date(filter.start)) &&
            (!filter.end || date <= new Date(filter.end))
          );
        } else if (field.type === "text" || field.type === "email") {
          // Filtro para campos de tipo string
          return applyStringFilter(item, field, filter.search || "");
        }
        return true; // Si no hay filtro, se incluye el elemento
      });
    });
  };

  // Datos filtrados
  const filteredData = filterData(data);

  return (
    <div className="item-list">
      <table>
        <thead>
          {/* Fila de Filtros */}
          <tr>
            {fields.filter(isFieldVisible).map((field) => (
              <th key={`${field.name}-filter`}>
                {/* Renderiza inputs de filtro según el tipo de campo */}
                {field.type === "number" && (
                  <>
                    <input
                      type="number"
                      placeholder="Min"
                      onChange={(e) => handleFilterChange(field.name, e.target.value, 'min')}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      onChange={(e) => handleFilterChange(field.name, e.target.value, 'max')}
                    />
                  </>
                )}
                {field.type === "date" && (
                  <>
                    <input
                      type="date"
                      placeholder="Inicio"
                      onChange={(e) => handleFilterChange(field.name, e.target.value, 'start')}
                    />
                    <input
                      type="date"
                      placeholder="Final"
                      onChange={(e) => handleFilterChange(field.name, e.target.value, 'end')}
                    />
                  </>
                )}
                {(field.type === "text" || field.type === "email") && (
                  <input
                    type="text"
                    placeholder="Buscar"
                    onChange={(e) => handleFilterChange(field.name, e.target.value, 'search')}
                  />
                )}
              </th>
            ))}
            <th></th> {/* Celda vacía para las acciones */}
          </tr>

          {/* Fila de Encabezados */}
          <tr>
            {fields.filter(isFieldVisible).map((field) => (
              <th key={field.name}>
                {field.label} {/* Muestra la etiqueta del campo */}
                <button onClick={() => onSort(field.name)}>
                  {/* Muestra un ícono de ordenación si el campo está siendo ordenado */}
                  {sortConfig.key === field.name
                    ? sortConfig.direction === "ascending"
                      ? "🔼"
                      : "🔽"
                    : null}
                </button>
              </th>
            ))}
            <th>Acciones</th> {/* Encabezado para la columna de acciones */}
          </tr>
        </thead>
        <tbody>
          {/* Renderiza las filas de datos filtrados */}
          {filteredData.map((item) => (
            <tr key={item.id}>
              {fields.filter(isFieldVisible).map((field) => (
                <td key={field.name}>
                  {/* Muestra el nombre de la persona si el campo es P_id, de lo contrario formatea el valor */}
                  {field.name === "P_id"
                    ? getPersonName(item[field.name], field)
                    : field.type === "number"
                    ? formatNumber(item[field.name])
                    : field.type === "date"
                    ? formatDate(item[field.name])
                    : item[field.name] || "N/A"}
                </td>
              ))}
              <td>
                {/* Componente para acciones (editar, eliminar) */}
                <ItemActions item={item} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable; // Exporta el componente DataTable