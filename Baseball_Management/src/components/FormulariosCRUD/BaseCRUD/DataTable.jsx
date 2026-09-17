// Baseball_Management/src/components/FormulariosCRUD/BaseCRUD/DataTable.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import ItemActions from "./ItemActions";

const PAGE_SIZES = [10, 25, 50, 100];

const initialsOf = (item) => {
  const name = item?.name || "";
  const last = item?.lastname || "";
  const a = (name.trim() ? name.trim()[0] : "") + (last.trim() ? last.trim()[0] : "");
  return a.toUpperCase() || "?";
};

const DataTable = ({
  data,
  fieldsVisible,
  sortConfig,
  onSort,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  loading,
  pageSize,
  onPageSizeChange,
  currentPage,
  totalPages,
  goToPage,
  filteredCount,
}) => {
  const [selected, setSelected] = React.useState(() => new Set());

  const pageIds = useMemo(() => data.map((d) => d.id), [data]);
  const allSelected = data.length > 0 && pageIds.every((id) => selected.has(id));

  const toggleRow = (id, checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAll = (checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) pageIds.forEach((id) => next.add(id));
      else pageIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selected.size === 0) return;
    const ok = await onBulkDelete(Array.from(selected));
    if (ok) setSelected(new Set());
  };

  const formatNumber = (value) => {
    if (typeof value === "number") {
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

  const displayValue = (item, field) => {
    const raw = item[field.name];
    if (raw === null || raw === undefined) return "—";
    if (field.type === "select" && field.options) {
      return field.options.find((o) => String(o.id) === String(raw))?.name ?? raw;
    }
    if (field.type === "number") return formatNumber(raw);
    if (field.type === "date") return formatDate(raw);
    return raw;
  };

  const renderSortIcon = (field) => {
    if (sortConfig.key !== field.name) return <ChevronsUpDown size={14} className="dt-sort-idle" />;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp size={14} className="dt-sort-active" />
    ) : (
      <ChevronDown size={14} className="dt-sort-active" />
    );
  };

  const columnFields = useMemo(() => fieldsVisible.filter((f) => f.name !== 'id'), [fieldsVisible]);

  const renderCell = (item, field) => {
    if (field.type === "password" || field.hidden) return null;
    if (field.name === "name") {
      const initials = initialsOf(item);
      return (
        <div className="bc-person">
          <span className="bc-person__avatar">{initials}</span>
          <div className="bc-person__body">
            <span className="bc-person__name">{item.name}</span>
            <span className="bc-person__sub">{item.lastname}</span>
          </div>
        </div>
      );
    }
    if (field.type === "select") {
      return <span className="bc-pill bc-pill--soft">{displayValue(item, field)}</span>;
    }
    if (field.type === "number") {
      return <span className="bc-cell-mono">{displayValue(item, field)}</span>;
    }
    return displayValue(item, field);
  };

  const pageNumbers = useMemo(() => {
    const total = totalPages;
    const current = currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  }, [totalPages, currentPage]);

  const startIndex = filteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredCount);

  return (
    <div className="bc-table-card">
      {/* Util strip */}
      <div className="bc-util">
        <div className="bc-util__left">
          <label className="bc-util__selectall">
            <input
              type="checkbox"
              className="bc-util__checkbox"
              checked={allSelected}
              onChange={(e) => toggleAll(e.target.checked)}
            />
            <span>Seleccionar Todos en Página</span>
          </label>
          <span className="bc-util__sep">|</span>
          <button
            className="bc-util__print"
            onClick={() => window.print()}
            title="Imprimir padrón"
          >
            <Printer size={15} /> Imprimir Padrón
          </button>
          {selected.size > 0 && (
            <>
              <span className="bc-util__selected">{selected.size} seleccionados</span>
              <button
                className="bc-util__bulk bc-util__bulk--danger"
                onClick={handleBulkDelete}
                title="Eliminar los registros seleccionados"
              >
                <Trash2 size={15} /> Eliminar seleccionados
              </button>
              <button
                className="bc-util__bulk"
                onClick={() => setSelected(new Set())}
                title="Quitar la selección"
              >
                <X size={15} /> Deseleccionar
              </button>
            </>
          )}
        </div>
        <div className="bc-util__right">
          <span className="bc-util__label">Filas por página:</span>
          <select
            className="bc-util__select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} registros
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bc-table-wrap">
        <table className="bc-table">
          <thead>
            <tr className="bc-thead">
              <th className="bc-th bc-th--check">
                <span className="sr-only">Seleccionar</span>
              </th>
              <th className="bc-th bc-th--sort" onClick={() => onSort("id")}>
                <div className="bc-th__inner">
                  <span>ID</span>
                  {renderSortIcon({ name: "id" })}
                </div>
              </th>
              {columnFields.map((field) => (
                <th
                  key={field.name}
                  className={`bc-th${field.type === "select" ? "" : " bc-th--sort"}`}
                  onClick={field.type !== "select" ? () => onSort(field.name) : undefined}
                >
                  <div className="bc-th__inner">
                    <span>{field.label}</span>
                    {field.type !== "select" && renderSortIcon(field)}
                  </div>
                </th>
              ))}
              <th className="bc-th bc-th--actions">Acciones Oficiales</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="bc-skeleton-row">
                  <td colSpan={columnFields.length + 3}>
                    <div className="bc-skeleton" />
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columnFields.length + 3} className="bc-empty">
                  <div className="bc-empty__inner">
                    <Search size={30} />
                    <p>No se encontraron registros</p>
                    <span>Prueba ajustando la búsqueda o los filtros.</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <motion.tr
                  key={item.id}
                  className={`bc-row${selected.has(item.id) ? " bc-row--selected" : ""}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.3) }}
                >
                  <td className="bc-td bc-td--check">
                    <input
                      type="checkbox"
                      className="bc-util__checkbox"
                      checked={selected.has(item.id)}
                      onChange={(e) => toggleRow(item.id, e.target.checked)}
                    />
                  </td>
                  <td className="bc-td">
                    <span className="bc-cell-mono bc-cell-id">
                      #{String(item.id).padStart(4, "0")}
                    </span>
                  </td>
                  {columnFields.map((field) => (
                    <td key={field.name} className="bc-td">
                      {renderCell(item, field)}
                    </td>
                  ))}
                  <td className="bc-td bc-td--actions">
                    <ItemActions item={item} onView={onView} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bc-pagination">
        <div className="bc-pagination__info">
          <span>
            Mostrando <strong>{startIndex} a {endIndex}</strong> de{" "}
            <strong>{filteredCount}</strong> registros | Página{" "}
            <strong>{currentPage} de {totalPages}</strong>
          </span>
        </div>
        <div className="bc-pagination__controls">
          <button
            className="bc-page-btn"
            disabled={currentPage === 1}
            onClick={() => goToPage(1)}
            title="Primera página"
          >
            <ChevronsLeft size={17} />
          </button>
          <button
            className="bc-page-btn"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            title="Página anterior"
          >
            <ChevronLeft size={17} />
          </button>
          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="bc-page-ellipsis">
                ...
              </span>
            ) : (
              <button
                key={p}
                className={`bc-page-btn${currentPage === p ? " bc-page-btn--active" : ""}`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            )
          )}
          <button
            className="bc-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            title="Página siguiente"
          >
            <ChevronRight size={17} />
          </button>
          <button
            className="bc-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(totalPages)}
            title="Última página"
          >
            <ChevronsRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;