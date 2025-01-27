import React from 'react';

const Filters = ({ table, fields, setFilters }) => {
    const handleFilterChange = (field, value, filterType) => {
        const parsedValue = value ? (field === 'age' || field === 'init_date' ? parseInt(value) : value) : "";
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

    return (
        <div>
            {fields.map((field) => (
                <div key={field}>
                    <label>{field}:</label>
                    {field === 'age' || field === 'init_date' ? (
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
                    ) : (
                        <input
                            type="text"
                            onChange={(e) => handleFilterChange(field, e.target.value)}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default Filters;
