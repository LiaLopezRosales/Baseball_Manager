import React, { useState, useEffect } from 'react';
import { getFieldsForTable } from './tables';
import Filters from './filters';

const fetchData = async (url, data) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `${response.status} ${response.statusText}: ${errorText}`;
        throw new Error(`Error fetching data: ${errorMessage}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : [];
};

const MyComponent = () => {
    const [data, setData] = useState([]);
    const [selectedTable, setSelectedTable] = useState('Person');
    const [fields, setFields] = useState(['name', 'age']); // Valores iniciales para la tabla por defecto
    const [filters, setFilters] = useState({});
    const [query, setQuery] = useState({}); // Estado para guardar el query

    useEffect(() => {
        const getData = async () => {
            const query = {
                table_name: selectedTable,
                fields: fields,
                filters: filters,
            };
            setQuery(query); // Guardar el query en el estado
            const result = await fetchData('http://127.0.0.1:8000/api/queries/dinamic-filter/', query);
            setData(result);
        };

        if (fields.length > 0) {
            getData();
        }
    }, [selectedTable, fields, filters]);

    const handleTableChange = (e) => {
        const table = e.target.value;
        setSelectedTable(table);
        const newFields = getFieldsForTable(table);
        setFields(newFields);
        setFilters({}); // Resetear los filtros al cambiar la tabla
    };

    return (
        <div>
            <h1>Resultados</h1>
            <label htmlFor="table-select">Elige una tabla:</label>
            <select id="table-select" onChange={handleTableChange} value={selectedTable}>
                <option value="Person">Person</option>
                <option value="Game">Games</option>
                <option value="Series">Series</option>
                {/* Añade aquí más opciones de tablas */}
            </select>

            <Filters table={selectedTable} fields={fields} setFilters={setFilters} />

            <h2>Query Enviado a la BD:</h2>
            <pre>{JSON.stringify(query, null, 2)}</pre> {/* Mostrar el query en pantalla */}

            <table>
                <thead>
                    <tr>
                        {fields.map(field => (
                            <th key={field}>{field}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {fields.map(field => (
                                <td key={field}>{row[field]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MyComponent;

