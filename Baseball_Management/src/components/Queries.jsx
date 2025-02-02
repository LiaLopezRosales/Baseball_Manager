import React, { useState, useEffect } from 'react';
import { getFieldsForTable } from './tables';
import Filters from './filters';

const fetchData = async (url, data) => {
  try {
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
  } catch (error) {
    console.error('Error en la solicitud:', error.message);
    return [];
  }
};

const getQueryFields = (fields) => fields.map((field) => field[1]);

// Mapeo de nombres de tablas en inglés a español
const tableNameMap = {
  Team: 'Equipos',
  Game: 'Juegos',
  Series: 'Series',
  Worker: 'Trabajadores',
  DirectionTeam: 'Equipos de Dirección',
  BaseballPlayer: 'Jugadores de Baseball',
  Season: 'Temporadas',
  Pitcher: 'Pitchers',
  TeamOnTheField: 'Equipo en Campo',
  StarPlayer: 'Jugador Estrella',
  PlayerInPosition: 'Jugadores en Posición',
  Score: 'Puntuaciones',
  BPParticipation: 'Participación de los Jugadores',
  PlayerSwap: 'Cambio de Jugador',
  PlayerInLineUp: 'Jugadores en Alineación',
};

// Lista de campos numéricos que pueden tener decimales
const numericFields = [
  'running_average',
  'effectiveness',
];

const Queries = ({ selectedTable }) => {
  const [data, setData] = useState([]);
  const [fields, setFields] = useState([]);
  const [filters, setFilters] = useState({});
  const [query, setQuery] = useState({});

  useEffect(() => {
    const getData = async () => {
      if (selectedTable) {
        const query = {
          table_name: selectedTable,
          fields: getQueryFields(fields),
          filters: filters,
        };
        setQuery(query);
        const result = await fetchData('http://127.0.0.1:8000/api/queries/dinamic-filter/', query);
        setData(result);
      }
    };

    if (selectedTable && fields.length > 0) {
      getData();
    }
  }, [selectedTable, fields, filters]);

  useEffect(() => {
    if (selectedTable) {
      const newFields = getFieldsForTable(selectedTable);
      setFields(newFields);
      setFilters({});
      setData([]);
    }
  }, [selectedTable]);

  // Obtener el nombre de la tabla en español
  const tableDisplayName = tableNameMap[selectedTable] || selectedTable;

  // Función para formatear valores numéricos
  const formatNumericValue = (value, field) => {
    if (numericFields.includes(field) && typeof value === 'number') {
      return value.toFixed(3); // Limita a 3 decimales
    }
    return value; // Devuelve el valor sin cambios si no es numérico
  };

  return (
    <div>
      <h2>{tableDisplayName}</h2>

      <Filters table={selectedTable} fields={fields} setFilters={setFilters} />

      <table>
        <thead>
          <tr>
            {fields.map(([header]) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {fields.map(([, field]) => (
                <td key={field}>
                  {/* Formatea el valor si el campo es numérico */}
                  {formatNumericValue(row[field], field)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Queries;