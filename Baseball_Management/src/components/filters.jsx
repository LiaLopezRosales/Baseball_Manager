import React from 'react';

const Filters = ({ table, fields, setFilters }) => {
    const handleFilterChange = (field, value, filterType) => {
        const parsedValue = value ? (filterType === 'gte' || filterType === 'lte' || filterType === 'month' || filterType === 'year' ? parseInt(value, 10) : value) : "";
        setFilters(prevFilters => {
            const newFilters = {
                ...prevFilters,
                [field]: {
                    ...prevFilters[field],
                    [filterType]: parsedValue
                }
            };

            // Eliminar el filtro si el valor está vacío
            if (!parsedValue) {
                delete newFilters[field][filterType];

                // Eliminar el campo del objeto si ya no tiene filtros
                if (Object.keys(newFilters[field]).length === 0) {
                    delete newFilters[field];
                }
            }

            return newFilters;
        });
    };

    const renderFilter = (field) => {
        if (field === 'age' || field === 'score' || field === 'series' || field === 'local' || field === 'rival') {
            return (
                <div>
                    <label>Mínimo:</label>
                    <input
                        type="number"
                        onChange={(e) => handleFilterChange(field, e.target.value, 'gte')}
                    />
                    <label>Máximo:</label>
                    <input
                        type="number"
                        onChange={(e) => handleFilterChange(field, e.target.value, 'lte')}
                    />
                </div>
            );
        } else if (field === 'init_date' || field === 'date') {
            return (
                <div>
                    <label>Mes:</label>
                    <input
                        type="number"
                        onChange={(e) => handleFilterChange(field, e.target.value, 'month')}
                    />
                    <label>Año:</label>
                    <input
                        type="number"
                        onChange={(e) => handleFilterChange(field, e.target.value, 'year')}
                    />
                </div>
            );
        } else {
            return (
                <input
                    type="text"
                    onChange={(e) => handleFilterChange(field, e.target.value, 'icontains')}
                />
            );
        }
    };

    return (
        <div>
            {fields.map((field) => (
                <div key={field}>
                    <label>{field}:</label>
                    {renderFilter(field)}
                </div>
            ))}
        </div>
    );
};

export default Filters;
