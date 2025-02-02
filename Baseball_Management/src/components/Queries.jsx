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

const numericFields = [
  'running_average',
  'effectiveness',
  'batting_average',
  'years_of_experience',
  'No_games_won',
  'No_games_lost',
  'w_points',
  'l_points',
];

const dateFields = [
  'init_date',
  'end_date',
  'date',
  'series__init_date',
  'series__end_date',
];

const Queries = ({ selectedTable }) => {
  const [data, setData] = useState([]);
  const [fields, setFields] = useState([]);
  const [filters, setFilters] = useState({});
  const [query, setQuery] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        setCurrentPage(1); // Resetear a la primera página con nuevos datos
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

  const tableDisplayName = tableNameMap[selectedTable] || selectedTable;

  const formatValue = (value, field) => {
    if (numericFields.includes(field) && typeof value === 'number') {
      return value.toFixed(3);
    }
    if (dateFields.includes(field) && value) {
      const date = new Date(value);
      return !isNaN(date) ? date.toLocaleDateString() : value;
    }
    return value;
  };

  // Calcular datos paginados
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Manejadores de paginación
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
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
          {paginatedData.map((row, index) => (
            <tr key={index}>
              {fields.map(([, field]) => (
                <td key={field}>{formatValue(row[field], field)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Controles de paginación */}
      <div className="pagination-controls">
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages || data.length === 0}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Queries;