import React from 'react';

// Componente `Filters` que recibe tres props: `table`, `fields` y `setFilters`.
const Filters = ({ table, fields, setFilters }) => {

    // Función `handleFilterChange` que se ejecuta cuando cambia el valor de un filtro.
    const handleFilterChange = (field, value, filterType) => {
        // Convierte el valor a número si el tipo de filtro es 'gte', 'lte', 'month' o 'year'.
        // Si el valor está vacío, se asigna una cadena vacía.
        const parsedValue = value ? (filterType === 'gte' || filterType === 'lte' || filterType === 'month' || filterType === 'year' ? parseInt(value, 10) : value) : "";

        // Actualiza el estado de los filtros usando la función `setFilters`.
        setFilters(prevFilters => {
            // Crea una copia de los filtros anteriores y actualiza el filtro actual.
            const newFilters = {
                ...prevFilters,
                [field]: {
                    ...prevFilters[field],
                    [filterType]: parsedValue
                }
            };

            // Si el valor del filtro está vacío, elimina ese filtro.
            if (!parsedValue) {
                delete newFilters[field][filterType];

                // Si el campo ya no tiene filtros, elimina el campo completo.
                if (Object.keys(newFilters[field]).length === 0) {
                    delete newFilters[field];
                }
            }

            // Retorna el nuevo objeto de filtros actualizado.
            return newFilters;
        });
    };

    // Función `renderFilter` que decide qué tipo de input mostrar según el campo.
    const renderFilter = (field) => {
        // Si el campo es 'age', 'score', 'series', 'local' o 'rival', muestra inputs para valores mínimos y máximos.
        if (field === 'age' || field === "P_id__age" || field === 'score' || field === "score__w_points" || field === "score__l_points" || field === "years_of_experience" || field === "No_games_won" || field === "No_games_lost" || field === "running_average" || field === "effectiveness" || field === "w_points" || field === "l_points") {
            return (
                <div>
                    <label>Mínimo:</label>
                    <input
                        type="number"
                        onChange={(e) => handleFilterChange(field, e.target.value, 'gte')} // Filtro "mayor o igual que"
                    />
                    <label>Máximo:</label>
                    <input
                        type="number"
                        onChange={(e) => handleFilterChange(field, e.target.value, 'lte')} // Filtro "menor o igual que"
                    />
                </div>
            );
        }
        // Si el campo es 'init_date' o 'date', muestra inputs para mes y año.
        else if (field === 'init_date' || field === 'end_date' || field === 'series__init_date' || field === 'series__end_date' || field === 'date') {
            return (
                <div>
                    <label>Mes:</label>
                    <input
                        type="number"
                        onChange={(e) => handleFilterChange(field, e.target.value, 'month')} // Filtro por mes
                    />
                    <label>Año:</label>
                    <input
                        type="number"
                        onChange={(e) => handleFilterChange(field, e.target.value, 'year')} // Filtro por año
                    />
                </div>
            );
        }
        // Para cualquier otro campo, muestra un input de texto.
        else {
            return (
                <input
                    type="text"
                    onChange={(e) => handleFilterChange(field, e.target.value, 'icontains')} // Filtro que busca coincidencias parciales
                />
            );
        }
    };

    // Renderiza el componente.
    return (
        <div>
            {/* Itera sobre el array `fields`, donde cada elemento es una tupla. */}
            {fields.map(([displayText, fieldValue]) => (
                <div key={fieldValue}>
                    {/* Muestra el texto que se verá en pantalla (primer elemento de la tupla). */}
                    <label>{displayText}:</label>
                    {/* Llama a `renderFilter` con el valor del campo (segundo elemento de la tupla). */}
                    {renderFilter(fieldValue)}
                </div>
            ))}
        </div>
    );
};

export default Filters;
