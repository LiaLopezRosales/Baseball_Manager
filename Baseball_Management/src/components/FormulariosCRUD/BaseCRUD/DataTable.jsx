import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import ItemActions from "./ItemActions";

const DataTable = ({
  data,
  fields,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  onFilter,
  loading,
}) => {
  const [filters, setFilters] = useState({});
  const [globalSearch, setGlobalSearch] = useState("");

  const fieldsVisible = useMemo(
    () => fields.filter((f) => !f.hidden && f.type !== "password"),
    [fields]
  );

  const handleFilterChange = (field, value, filterType) => {
    const newFilters = {
      ...filters,
      [field]: { ...filters[field], [filterType]: value },
    };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const formatNumber = (value) => {    if (typeof value === "number") {
      return Number.isInteger(value) ? value.toString() : value.toFixed(3);
    }
    return value;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  const getPersonName = (P_id, field) => {
    if (!field.options) return "N/A";
    const person = field.options.find((option) => option.id === P_id);
    return person ? person.name : "N/A";
  };

  const applyStringFilter = (item, field, filterValue) => {
    if (field.name === "P_id") {
      return getPersonName(item[field.name], field)
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    }
    const fieldValue = item[field.name]
      ? item[field.name].toString().toLowerCase()
      : "";
    return fieldValue.includes(filterValue.toLowerCase());
  };

  const filterData = (data) => {
    return data.filter((item) => {
      return Object.keys(filters).every((fieldName) => {
        const field = fields.find((f) => f.name === fieldName);
        if (!field) return true;

        const filter = filters[fieldName];
        if (field.type === "number") {
          const value = item[fieldName];
          return (
            (!filter.min || value >= parseFloat(filter.min)) &&
            (!filter.max || value <= parseFloat(filter.max))
          );
        } else if (field.type === "date") {
          const date = new Date(item[fieldName]);
          return (
            (!filter.start || date >= new Date(filter.start)) &&
            (!filter.end || date <= new Date(filter.end))
          );
        } else if (field.type === "text" || field.type === "email") {
          return applyStringFilter(item, field, filter.search || "");
        }
        return true;
      });
    });
  };

  const matchesGlobal = (item) => {
    if (!globalSearch.trim()) return true;
    const q = globalSearch.toLowerCase();
    return fieldsVisible.some((field) => {
      const raw = item[field.name];
      if (field.name === "P_id") {
        return getPersonName(item[field.name], field)
          .toLowerCase()
          .includes(q);
      }
      return raw !== null && raw !== undefined
        ? String(raw).toLowerCase().includes(q)
        : false;
    });
  };

  const filteredData = filterData(data).filter(matchesGlobal);

  const renderSortIcon = (field) => {
    if (sortConfig.key !== field.name)
      return <ChevronsUpDown size={14} className="dt-sort-idle" />;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp size={14} className="dt-sort-active" />
    ) : (
      <ChevronDown size={14} className="dt-sort-active" />
    );
  };

  return (
    <div className="item-list">
      {/* Barra de búsqueda global */}
      <div className="dt-toolbar">
        <div className="dt-search">
          <Search size={16} className="dt-search__icon" />
          <input
            type="text"
            placeholder="Buscar en todos los campos…"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="dt-search__input"
          />
        </div>
      </div>

      <div className="dt-table-wrap">
        <table className="dt-table">
          <thead>
            <tr className="dt-filter-row">
              {fieldsVisible.map((field) => (
                <th key={`${field.name}-filter`}>
                  {field.type === "number" && (
                    <div className="dt-filter-range">
                      <input
                        type="number"
                        placeholder="Min"
                        onChange={(e) =>
                          handleFilterChange(field.name, e.target.value, "min")
                        }
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        onChange={(e) =>
                          handleFilterChange(field.name, e.target.value, "max")
                        }
                      />
                    </div>
                  )}
                  {field.type === "date" && (
                    <div className="dt-filter-range">
                      <input
                        type="date"
                        placeholder="Inicio"
                        onChange={(e) =>
                          handleFilterChange(field.name, e.target.value, "start")
                        }
                      />
                      <input
                        type="date"
                        placeholder="Final"
                        onChange={(e) =>
                          handleFilterChange(field.name, e.target.value, "end")
                        }
                      />
                    </div>
                  )}
                  {(field.type === "text" || field.type === "email") && (
                    <input
                      type="text"
                      placeholder="Buscar"
                      onChange={(e) =>
                        handleFilterChange(field.name, e.target.value, "search")
                      }
                    />
                  )}
                </th>
              ))}
              <th className="dt-actions-head"></th>
            </tr>

            <tr className="dt-header-row">
              {fieldsVisible.map((field) => (
                <th key={field.name} className="dt-th">
                  <button
                    className="dt-sort-btn"
                    onClick={() => onSort(field.name)}
                    title={`Ordenar por ${field.label}`}
                  >
                    {field.label} {renderSortIcon(field)}
                  </button>
                </th>
              ))}
              <th className="dt-actions-head">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="dt-skeleton-row">
                  {fieldsVisible.map((f, j) => (
                    <td key={j} className="dt-cell">
                      <div className="dt-skeleton-cell" />
                    </td>
                  ))}
                  <td className="dt-cell">
                    <div className="dt-skeleton-actions" />
                  </td>
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={fieldsVisible.length + 1}
                  className="dt-empty"
                >
                  <div className="dt-empty__inner">
                    <Search size={32} />
                    <p>No se encontraron registros</p>
                    <span>Prueba ajustando la búsqueda o los filtros.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  className="dt-row"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
                >
                  {fieldsVisible.map((field) => (
                    <td key={field.name} className="dt-cell">
                      {field.name === "P_id"
                        ? getPersonName(item[field.name], field)
                        : field.type === "number"
                        ? formatNumber(item[field.name])
                        : field.type === "date"
                        ? formatDate(item[field.name])
                        : item[field.name] || "—"}
                    </td>
                  ))}
                  <td className="dt-cell dt-actions">
                    <ItemActions item={item} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
