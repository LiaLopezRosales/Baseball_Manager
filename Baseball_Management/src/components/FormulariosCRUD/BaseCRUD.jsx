import React from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Plus } from "lucide-react";
import DataTable from "./BaseCRUD/DataTable";
import CRUDForm from "./BaseCRUD/CRUDForm";
import useCRUD from "./BaseCRUD/useCRUD";
import "./BaseCRUD.css";

const BaseCRUD = ({ apiUrl, fields, title, initialFormValues }) => {
  const {
    paginatedData,
    actions,
    form,
    sortConfig,
    totalPages,
    currentPage,
    loading,
  } = useCRUD(apiUrl, fields, initialFormValues);

  return (
    <div className="base-crud-container">
      <div className="base-crud-header">
        <h1 className="base-crud-title">{title}</h1>
        <div className="base-crud-actions">
          <button className="refresh-button" onClick={actions.fetchItems}>
            <RefreshCw size={16} /> Actualizar
          </button>
          <button className="add-button" onClick={actions.handleCreate}>
            <Plus size={16} /> Añadir
          </button>
        </div>
      </div>

      <DataTable
        data={paginatedData}
        fields={fields}
        sortConfig={sortConfig}
        onSort={actions.handleSort}
        onEdit={actions.handleEdit}
        onDelete={actions.handleDelete}
        onFilter={actions.handleFilter}
        loading={loading}
      />

      <div className="pagination-controls">
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => actions.goToPage(currentPage - 1)}
          title="Página anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="page-info">
          Página <strong>{currentPage}</strong> de {totalPages}
        </span>
        <button
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => actions.goToPage(currentPage + 1)}
          title="Página siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {(form.isCreating || form.isEditing) && (
        <CRUDForm
          fields={fields}
          formValues={form.values}
          formErrors={form.errors}
          onChange={actions.handleInputChange}
          onSave={actions.handleSave}
          onCancel={actions.handleCancel}
        />
      )}
    </div>
  );
};

export default BaseCRUD;
