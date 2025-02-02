import React, { useState, useEffect } from "react";
import ItemActions from "./ItemActions";

const DataTable = ({
  data,
  fields,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  onFilter,
  hasPIdField,
  personData = {},
  isPersonasTable,
}) => {
  const [localFilters, setLocalFilters] = useState({});
  const [nombreFilter, setNombreFilter] = useState("");
  const [apellidoFilter, setApellidoFilter] = useState("");

  // Sincronizar filtros principales con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilter(localFilters);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [localFilters, onFilter]);

  // Determinar visibilidad de campos
  const isFieldVisible = (field) => {
    if (isPersonasTable && field.name === "P_id") return false;
    return !field.hidden && field.type !== "password";
  };

  // Formateadores de datos
  const formatNumber = (value) => {
    if (typeof value !== "number") return value;
    return Number.isInteger(value) ? value.toString() : value.toFixed(3);
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return isNaN(date) ? "Fecha inválida" : date.toLocaleDateString();
  };

  // Filtrar datos combinando todos los filtros
  const filteredData = data.filter(item => {
    // Filtros para campos normales
    const mainFieldsMatch = Object.entries(localFilters).every(([fieldName, filter]) => {
      const field = fields.find(f => f.name === fieldName);
      const value = item[fieldName];
      
      if (!filter) return true;
      if (field?.type === "number") {
        return (!filter.min || value >= filter.min) && 
               (!filter.max || value <= filter.max);
      }
      if (field?.type === "date") {
        const dateValue = new Date(value);
        return (!filter.start || dateValue >= new Date(filter.start)) &&
               (!filter.end || dateValue <= new Date(filter.end));
      }
      return !filter.search || value.toString().toLowerCase().includes(filter.search.toLowerCase());
    });

    // Filtros para campos relacionados (Persona)
    const nombrePersona = personData[item.P_id]?.name?.toLowerCase() || "";
    const apellidoPersona = personData[item.P_id]?.lastname?.toLowerCase() || "";
    
    const nombreMatch = nombrePersona.includes(nombreFilter.toLowerCase());
    const apellidoMatch = apellidoPersona.includes(apellidoFilter.toLowerCase());

    return mainFieldsMatch && nombreMatch && apellidoMatch;
  });

  return (
    <div className="item-list">
      <table>
        <thead>
          {/* Fila de Filtros */}
          <tr>
            {fields.filter(isFieldVisible).map((field) => (
              <th key={`filter-${field.name}`}>
                {field.type === "text" || field.type === "email" ? (
                  <input
                    type="text"
                    placeholder={`Buscar ${field.label}`}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      [field.name]: { search: e.target.value }
                    }))}
                  />
                ) : field.type === "number" ? (
                  <>
                    <input
                      type="number"
                      placeholder="Mín"
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        [field.name]: { 
                          ...prev[field.name], 
                          min: e.target.value 
                        }
                      }))}
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        [field.name]: { 
                          ...prev[field.name], 
                          max: e.target.value 
                        }
                      }))}
                    />
                  </>
                ) : field.type === "date" ? (
                  <>
                    <input
                      type="date"
                      placeholder="Inicio"
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        [field.name]: { 
                          ...prev[field.name], 
                          start: e.target.value 
                        }
                      }))}
                    />
                    <input
                      type="date"
                      placeholder="Fin"
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        [field.name]: { 
                          ...prev[field.name], 
                          end: e.target.value 
                        }
                      }))}
                    />
                  </>
                ) : null}
              </th>
            ))}
            
            {/* Filtros para columnas relacionadas */}
            {hasPIdField && !isPersonasTable && (
              <>
                <th>
                  <input
                    type="text"
                    placeholder="Buscar Nombre"
                    onChange={(e) => setNombreFilter(e.target.value)}
                  />
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Buscar Apellido"
                    onChange={(e) => setApellidoFilter(e.target.value)}
                  />
                </th>
              </>
            )}
            <th></th>
          </tr>

          {/* Encabezados */}
          <tr>
            {fields.filter(isFieldVisible).map((field) => (
              <th key={field.name}>
                {field.label}
                <button onClick={() => onSort(field.name)}>
                  {sortConfig.key === field.name && (
                    sortConfig.direction === "ascending" ? "🔼" : "🔽"
                  )}
                </button>
              </th>
            ))}
            {hasPIdField && !isPersonasTable && (
              <>
                <th>Nombre (Persona)</th>
                <th>Apellido (Persona)</th>
              </>
            )}
            <th>Acciones</th>
          </tr>
        </thead>
        
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.id}>
              {fields.filter(isFieldVisible).map((field) => (
                <td key={field.name}>
                  {field.type === "number" 
                    ? formatNumber(item[field.name])
                    : field.type === "date"
                    ? formatDate(item[field.name])
                    : item[field.name]}
                </td>
              ))}
              {hasPIdField && !isPersonasTable && (
                <>
                  <td>{personData[item.P_id]?.name || "N/A"}</td>
                  <td>{personData[item.P_id]?.lastname || "N/A"}</td>
                </>
              )}
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