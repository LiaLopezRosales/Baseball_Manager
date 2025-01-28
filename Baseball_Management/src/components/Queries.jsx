import React, { useState, useEffect } from 'react';
import { getFieldsForTable } from './tables'; // Importa una función para obtener los campos de una tabla específica.
import Filters from './filters'; // Importa el componente `Filters` para manejar los filtros.

// Función asíncrona para realizar una solicitud HTTP POST y obtener datos.
const fetchData = async (url, data) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Convierte los datos a JSON y los envía en el cuerpo de la solicitud.
    });

    // Si la respuesta no es exitosa, lanza un error con detalles.
    if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `${response.status} ${response.statusText}: ${errorText}`;
        throw new Error(`Error fetching data: ${errorMessage}`);
    }

    // Si la respuesta es exitosa, convierte el texto de la respuesta a JSON.
    const text = await response.text();
    return text ? JSON.parse(text) : [];
};

// Función para extraer el segundo elemento de cada tupla en el array `fields`.
const getQueryFields = (fields) => fields.map(field => field[1]);

// Componente principal `Queries`.
const Queries = () => {
    // Estados del componente:
    const [data, setData] = useState([]); // Almacena los datos obtenidos de la API.
    const [selectedTable, setSelectedTable] = useState(''); // Almacena la tabla seleccionada.
    const [fields, setFields] = useState([]); // Almacena los campos de la tabla seleccionada.
    const [filters, setFilters] = useState({}); // Almacena los filtros aplicados.
    const [query, setQuery] = useState({}); // Almacena el query que se envía a la API.

    // Efecto que se ejecuta cuando cambia `selectedTable`, `fields` o `filters`.
    useEffect(() => {
        const getData = async () => {
            // Construye el objeto `query` con la tabla seleccionada, los campos y los filtros.
            const query = {
                table_name: selectedTable,
                fields: getQueryFields(fields),
                filters: filters,
            };
            setQuery(query); // Guarda el query en el estado.
            
            // Realiza la solicitud a la API para obtener los datos filtrados.
            const result = await fetchData('http://127.0.0.1:8000/api/queries/dinamic-filter/', query);
            setData(result); // Actualiza el estado `data` con los resultados obtenidos.
        };

        // Solo realiza la solicitud si hay campos definidos.
        if (fields.length > 0) {
            getData();
        }
    }, [selectedTable, fields, filters]);

    // Función que se ejecuta cuando el usuario selecciona una tabla diferente.
    const handleTableChange = (e) => {
        const table = e.target.value; // Obtiene el valor de la tabla seleccionada.
        setSelectedTable(table); // Actualiza el estado `selectedTable`.
        const newFields = getFieldsForTable(table); // Obtiene los campos de la nueva tabla.
        setFields(newFields); // Actualiza el estado `fields`.
        setFilters({}); // Reinicia los filtros al cambiar de tabla.
    };

    // Renderizado del componente.
    return (
        <div>
            <h1>Resultados</h1>
            {/* Selector para elegir una tabla */}
            <label htmlFor="table-select">Elige una tabla:</label>
            <select id="table-select" onChange={handleTableChange} value={selectedTable}>
                <option value="Team">Equipos</option>
                <option value="Game">Juegos</option>
                <option value="Series">Series</option>
                <option value="Worker">Trabajadores</option>
                <option value="DirectionTeam">Equipos de Dirección</option>
                <option value="BaseballPlayer">Jugadores de Baseball</option>
                <option value="Season">Temporadas</option>
                <option value="Pitcher">Pitchers</option>
                <option value="TeamOnTheField">Equipo en Campo</option>
                <option value="StarPlayer">Jugador Estrella</option>
                <option value="PlayerInPosition">Jugadores en Posición</option>
                <option value="Score">Puntuaciones</option>
                <option value="BPParticipation">Participación de los Jugadores</option>
                <option value="PlayerSwap">Cambio de Jugador</option>
                <option value="PlayerInLineUp">Jugadores en Alineción</option>
                {/* Más opciones de tablas pueden añadirse aquí */}
            </select>

            {/* Componente `Filters` para manejar los filtros */}
            <Filters table={selectedTable} fields={fields} setFilters={setFilters} />

            {/* Sección para mostrar el query enviado a la base de datos (comentado por ahora) */}
            {/* <h2>Query Enviado a la BD:</h2>
            <pre>{JSON.stringify(query, null, 2)}</pre> */}

            {/* Tabla para mostrar los datos obtenidos */}
            <table>
                <thead>
                    <tr>
                        {/* Mapea los campos para crear las columnas de la tabla */}
                        {fields.map(([header]) => (
                            <th key={header}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* Mapea los datos para crear las filas de la tabla */}
                    {data.map((row, index) => (
                        <tr key={index}>
                            {/* Mapea los campos para mostrar los valores de cada fila */}
                            {fields.map(([, field]) => (
                                <td key={field}>{row[field]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Queries;
