import React from "react";
import DataTable from "./BaseCRUD/DataTable";
import CRUDForm from "./BaseCRUD/CRUDForm";
import useCRUD from "./BaseCRUD/useCRUD";
import "./BaseCRUD.css";

const BaseCRUD = ({ apiUrl, fields, title, initialFormValues }) => {
  const {
    paginatedData,
    totalPages,
    currentPage,
    sortConfig,
    personData,
    form,
    actions,
  } = useCRUD(apiUrl, fields, initialFormValues);

  const hasPIdField = fields.some(f => f.name === "P_id");

  // Determinar si es la tabla de "Personas"
  const isPersonasTable = title === "Personas";

  return (
    <div className="base-crud-container">
      <h1>{title}</h1>

      <div className="crud-actions">
        <button onClick={actions.handleCreate}>Añadir Elemento</button>
        <button onClick={actions.fetchItems}>Actualizar Lista</button>
      </div>

      <DataTable
        data={paginatedData}
        fields={fields}
        sortConfig={sortConfig}
        onSort={actions.handleSort}
        onEdit={actions.handleEdit}
        onDelete={actions.handleDelete}
        onFilter={actions.handleFilter}
        hasPIdField={hasPIdField}
        personData={personData}
        isPersonasTable={isPersonasTable} // Pasar la propiedad
      />

      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => actions.goToPage(currentPage - 1)}
        >
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => actions.goToPage(currentPage + 1)}
        >
          Siguiente
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