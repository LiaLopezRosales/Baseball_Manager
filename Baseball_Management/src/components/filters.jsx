import React from 'react';

// Generador de opciones de meses
const generateMonthOptions = () => {
  const months = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(0, i);
    months.push({
      value: i + 1,  // Los meses van de 1 a 12
      name: date.toLocaleString('es-ES', { month: 'long' })
    });
  }
  return months;
};

// Generador de opciones de años
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1900; year--) {
    years.push(year);
  }
  return years;
};

const Filters = ({ table, fields, setFilters }) => {
  const months = generateMonthOptions();
  const years = generateYearOptions();

  const handleFilterChange = (field, value, filterType) => {
    const parsedValue = value ? parseInt(value, 10) : "";
    
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [field]: {
          ...prevFilters[field],
          [filterType]: parsedValue
        }
      };

      if (!parsedValue) {
        delete newFilters[field][filterType];
        if (Object.keys(newFilters[field]).length === 0) {
          delete newFilters[field];
        }
      }

      return newFilters;
    });
  };

  const renderFilter = (field) => {
    if (field === 'age' || field === "P_id__age" || field === 'score' || field === "score__w_points" || field === "score__l_points" || field === "years_of_experience" || field === "No_games_won" || field === "No_games_lost" || field === "running_average" || field === "effectiveness" || field === "w_points" || field === "l_points") {
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
    }
    else if (field === 'init_date' || field === 'end_date' || field === 'series__init_date' || field === 'series__end_date' || field === 'date') {
      return (
        <div>
          <div className="filter-group">
            <label>Mes:</label>
            <select
              onChange={(e) => handleFilterChange(field, e.target.value, 'month')}
            >
              <option value="">Seleccionar mes</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.name.charAt(0).toUpperCase() + month.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Año:</label>
            <select
              onChange={(e) => handleFilterChange(field, e.target.value, 'year')}
            >
              <option value="">Seleccionar año</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }
    else {
      return (
        <input
          type="text"
          onChange={(e) => handleFilterChange(field, e.target.value, 'icontains')}
        />
      );
    }
  };

  return (
    <div className="filters-container">
      {fields.map(([displayText, fieldValue]) => (
        <div key={fieldValue} className="filter-item">
          <label>{displayText}:</label>
          <div className="filter-controls">
            {renderFilter(fieldValue)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Filters;