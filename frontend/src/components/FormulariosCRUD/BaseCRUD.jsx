// frontend/src/components/FormulariosCRUD/BaseCRUD.jsx

import React, { useMemo, useState } from "react";
import {
  RefreshCw,
  Download,
  Plus,
  Search,
  Filter,
  RotateCcw,
  X,
} from "lucide-react";
import Modal from "../Modal";
import DataTable from "./BaseCRUD/DataTable";
import CRUDForm from "./BaseCRUD/CRUDForm";
import useCRUD from "./BaseCRUD/useCRUD";
import { DEFAULT_CRUD_KPIS, CRUD_HERO, CRUD_HERO_DEFAULT } from "./kpiDefs";
import "./BaseCRUD.css";

const BaseCRUD = ({
  apiUrl,
  fields,
  title,
  subtitle = "Administración integral del padrón del campeonato. Sincronizado con el nodo federativo.",
  initialFormValues,
  kpis = DEFAULT_CRUD_KPIS,
  quickFilters = [],
}) => {
  const {
    data,
    filteredData,
    paginatedData,
    totalPages,
    currentPage,
    pageSize,
    loading,
    fieldsVisible,
    filters,
    globalSearch,
    sortConfig,
    form,
    actions,
  } = useCRUD(apiUrl, fields, initialFormValues);

  const [draftGlobal, setDraftGlobal] = useState("");
  const [draftFields, setDraftFields] = useState({});
  const [viewItem, setViewItem] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [activeQuick, setActiveQuick] = useState(null); // label del chip activo

  // ── Hero por entidad (título oficial del módulo) ─────
  const hero = CRUD_HERO[title] || CRUD_HERO_DEFAULT;

  const activeFilterCount =
    Object.values(filters).filter(
      (f) => f && (f.search?.length || f.min || f.max || f.start || f.end)
    ).length + (globalSearch.trim().length ? 1 : 0);

  // ── Filtro panel ------------------------------------
  const setDraftField = (name, key, value) => {
    setDraftFields((prev) => {
      const field = { ...(prev[name] || {}) };
      if (value === "" || value === null || value === undefined) delete field[key];
      else field[key] = value;
      const next = { ...prev };
      if (Object.keys(field).length) next[name] = field;
      else delete next[name];
      return next;
    });
  };

  const applyFilters = () => {
    actions.handleFilter(draftFields);
    actions.handleGlobalSearch(draftGlobal);
  };

  const clearFilters = () => {
    setDraftGlobal("");
    setDraftFields({});
    setActiveQuick(null);
    actions.clearFilters();
  };

  // ── Export CSV --------------------------------------
  const handleExport = async () => {
    const token = localStorage.getItem("token");
    if (!token || exporting) return;
    const rows = filteredData.map((item) => {
      const row = {};
      fieldsVisible.forEach((field) => {
        const raw = item[field.name];
        if (field.type === "select" && field.options) {
          row[field.label] = field.options.find((o) => String(o.id) === String(raw))?.name ?? raw;
        } else {
          row[field.label] = raw ?? "";
        }
      });
      return row;
    });
    if (!rows.length) {
      alert("No hay registros que exportar con los filtros actuales.");
      return;
    }
    const base = process.env.REACT_APP_API_URL || "http://localhost:8000";
    // El backend usa el nombre de la sección como encabezado del CSV
    const data = { [title]: rows };
    setExporting(true);
    try {
      const res = await fetch(`${base}/api/queries/export/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ format: "csv", data, filename: `${title.toLowerCase()}_padron` }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.toLowerCase()}_padron.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("No se pudo exportar el CSV. Inicia sesión como Administrador.");
    } finally {
      setExporting(false);
    }
  };

  // ── KPIs ---------------------------------------------
  const kpiCards = useMemo(
    () =>
      kpis.slice(0, 4).map((kpi) => {
        const Icon = kpi.icon;
        const k = kpi.compute(data, fields);
        return (
          <div className={`bc-kpi bc-kpi--${k.tone || "neutral"}`} key={kpi.label}>
            <span className="bc-kpi__icon">{Icon && <Icon size={22} />}</span>
            <span className="bc-kpi__label">{kpi.label}</span>
            <strong className="bc-kpi__value">{k.value}</strong>
            {k.sub && <span className="bc-kpi__sub">{k.sub}</span>}
          </div>
        );
      }),
    [kpis, data, fields]
  );

  // ── Quick filters -------------------------------------
  const quickChips = useMemo(() => {
    const all = { label: "Todos", fn: null, count: data.length };
    const extras = quickFilters.map((qf) => ({
      label: qf.label,
      fn: qf.fn,
      count: qf.fn ? data.filter(qf.fn).length : data.length,
    }));
    return [all, ...extras];
  }, [data, quickFilters]);

  // ── Render de filtro por tipo --------------------------
  const renderFilterControl = (field) => {
    if (field.name === "id") return null;
    if (field.type === "select" && field.options) {
      const value = draftFields[field.name]?.search || "";
      return (
        <div className="bc-filter__field" key={field.name}>
          <label className="bc-filter__field-label">Buscar {field.label}</label>
          <select
            className="bc-filter__input"
            value={value}
            onChange={(e) => setDraftField(field.name, "search", e.target.value)}
          >
            <option value="">Todos</option>
            {field.options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      );
    }
    if (field.type === "number") {
      return (
        <div className="bc-filter__field" key={field.name}>
          <label className="bc-filter__field-label">Rango {field.label}</label>
          <div className="bc-filter__range">
            <input
              type="number"
              className="bc-filter__input"
              placeholder="Mín."
              value={draftFields[field.name]?.min || ""}
              onChange={(e) => setDraftField(field.name, "min", e.target.value)}
            />
            <span className="bc-filter__range-sep">—</span>
            <input
              type="number"
              className="bc-filter__input"
              placeholder="Máx."
              value={draftFields[field.name]?.max || ""}
              onChange={(e) => setDraftField(field.name, "max", e.target.value)}
            />
          </div>
        </div>
      );
    }
    if (field.type === "date") {
      return (
        <div className="bc-filter__field" key={field.name}>
          <label className="bc-filter__field-label">Rango {field.label}</label>
          <div className="bc-filter__range">
            <input
              type="date"
              className="bc-filter__input"
              value={draftFields[field.name]?.start || ""}
              onChange={(e) => setDraftField(field.name, "start", e.target.value)}
            />
            <span className="bc-filter__range-sep">—</span>
            <input
              type="date"
              className="bc-filter__input"
              value={draftFields[field.name]?.end || ""}
              onChange={(e) => setDraftField(field.name, "end", e.target.value)}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="bc-filter__field" key={field.name}>
        <label className="bc-filter__field-label">Buscar {field.label}</label>
        <div className="bc-filter__search-wrap">
          <Search size={14} className="bc-filter__search-icon" />
          <input
            className="bc-filter__input bc-filter__input--with-icon"
            placeholder={`Buscar ${field.label.toLowerCase()}...`}
            value={draftFields[field.name]?.search || ""}
            onChange={(e) => setDraftField(field.name, "search", e.target.value)}
          />
        </div>
      </div>
    );
  };

  // ── Modal de detalle (Ver) -----------------------------
  const renderDetailModal = () => {
    if (!viewItem) return null;
    return (
      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)}>
        <div className="bc-detail">
          <span className="bc-detail__kicker">Ficha {title}</span>
          <h3 className="bc-detail__title">
            {[viewItem.name, viewItem.lastname]
              .filter(Boolean)
              .join(" ") || `Registro #${viewItem.id}`}
          </h3>
          <div className="bc-detail__grid">
            {fieldsVisible.map((field) => {
              const raw = viewItem[field.name];
              let value = raw ?? "—";
              if (field.type === "select" && field.options) {
                value = field.options.find((o) => String(o.id) === String(raw))?.name ?? raw ?? "—";
              } else if (field.type === "date" && raw) {
                const d = new Date(raw);
                value = isNaN(d.getTime())
                  ? raw
                  : new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(d);
              }
              return (
                <div className="bc-detail__item" key={field.name}>
                  <span className="bc-detail__field">{field.label}</span>
                  <span className="bc-detail__value">{String(value)}</span>
                </div>
              );
            })}
          </div>
          <div className="bc-detail__actions">
            <button className="bc-detail__close" onClick={() => setViewItem(null)}>
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="bc">
      {/* Hero */}
      <div className="bc-hero">
        <div className="bc-hero__text">
          <span className="bc-hero__kicker">MÓDULO FEDERATIVO · ADMINISTRACIÓN</span>
          <h2 className="bc-hero__title">{hero.title}</h2>
          <p className="bc-hero__sub">{hero.subtitle || subtitle}</p>
        </div>
        <div className="bc-hero__actions">
          <button
            className="bc-hero__btn"
            onClick={() => actions.fetchItems()}
            title="Recargar datos desde el nodo"
          >
            <RefreshCw size={16} /> Actualizar Datos
          </button>
          <button
            className="bc-hero__btn"
            onClick={handleExport}
            disabled={exporting}
            title="Exportar el padrón filtrado a CSV"
          >
            <Download size={16} /> {exporting ? "Exportando..." : "Exportar CSV"}
          </button>
          <button className="bc-hero__btn bc-hero__btn--primary" onClick={actions.handleCreate}>
            <Plus size={18} /> + Registrar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="bc-kpis">{kpiCards}</div>

      {/* Form */}
      {(form.isCreating || form.isEditing) && (
        <CRUDForm
          fields={fieldsVisible}
          formValues={form.values}
          formErrors={form.errors}
          onChange={actions.handleInputChange}
          onSave={actions.handleSave}
          onCancel={actions.handleCancel}
        />
      )}

      {/* Filter panel */}
      <div className="bc-filter">
        <div className="bc-filter__top">
          <span className="bc-filter__badge">
            <Filter size={14} /> PANEL DE FILTRADO TÉCNICO
          </span>
          <div className="bc-filter__search">
            <Search size={16} className="bc-filter__search-icon" />
            <input
              className="bc-filter__search-input"
              placeholder="Buscar en el padrón..."
              value={draftGlobal}
              onChange={(e) => setDraftGlobal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
            {draftGlobal ? (
              <button
                className="bc-filter__search-clear"
                onClick={() => setDraftGlobal("")}
                title="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            ) : (
              <span className="bc-filter__global-tag">FILTRO GLOBAL</span>
            )}
          </div>
        </div>

        <div className="bc-filter__grid">{fieldsVisible.map(renderFilterControl)}</div>

        <div className="bc-filter__bottom">
          <div className="bc-filter__chips">
            {quickChips.map((chip) => {
              const isActive = activeQuick === chip.label;
              return (
                <button
                  key={chip.label}
                  className={`bc-chip${isActive ? " bc-chip--active" : ""}`}
                  onClick={() => {
                    setActiveQuick(chip.label);
                    actions.handleQuickFilter(chip);
                  }}
                >
                  {chip.label} <span className="bc-chip__count">{chip.count}</span>
                </button>
              );
            })}
          </div>
          <div className="bc-filter__controls">
            <button className="bc-filter__apply" onClick={applyFilters}>
              Aplicar Filtros
            </button>
            <button className="bc-filter__reset" onClick={clearFilters} title="Limpiar todos los filtros">
              <RotateCcw size={15} /> Limpiar
            </button>
          </div>
        </div>

        <div className="bc-filter__summary">
          <strong>{filteredData.length}</strong> de <strong>{data.length}</strong> {title} ·{" "}
          {activeFilterCount > 0 ? "Padrón filtrado" : "Padrón completo"}
          {activeFilterCount > 0 && (
            <span className="bc-filter__summary-badge">{activeFilterCount} filtros activos</span>
          )}
        </div>
      </div>

      {/* Tabla */}
      <DataTable
        data={paginatedData}
        fieldsVisible={fieldsVisible}
        sortConfig={sortConfig}
        onSort={actions.handleSort}
        onView={setViewItem}
        onEdit={actions.handleEdit}
        onDelete={actions.handleDelete}
        onBulkDelete={actions.handleBulkDelete}
        loading={loading}
        pageSize={pageSize}
        onPageSizeChange={actions.setPage}
        currentPage={currentPage}
        totalPages={totalPages}
        goToPage={actions.goToPage}
        filteredCount={filteredData.length}
      />

      {/* Footer regulatorio */}
      <div className="bc-footnotes">
        <p>
          • Los datos mostrados provienen de la base habilitada del campeonato y se sincronizan en
          tiempo real con el nodo federativo (LNB Pro).
        </p>
        <p>
          • El padrón se administra conforme al Estatuto Técnico WBSC Art. 84 vigente; toda
          modificación queda registrada en el historial de auditoría.
        </p>
        <p>
          • Para acciones masivas o migración de series contacte a la Administración Central del
          campeonato.
        </p>
      </div>

      {/* Modal Ver */}
      {renderDetailModal()}
    </div>
  );
};

export default BaseCRUD;