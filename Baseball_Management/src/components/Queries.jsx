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
    return []; // Devuelve un array vacío en caso de error
  }
};

const getQueryFields = (fields) => fields.map((field) => field[1]);

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
      setFilters({}); // Reinicia los filtros al cambiar de tabla
      setData([]); // Reinicia los datos al cambiar de tabla
    }
  }, [selectedTable]);

  return (
    <div>

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