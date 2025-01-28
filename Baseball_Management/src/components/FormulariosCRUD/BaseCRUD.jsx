// Baseball_Management/src/components/FormulariosCRUD/BaseCRUD.jsx

import React from "react";
import DataTable from "./BaseCRUD/DataTable";
import CRUDForm from "./BaseCRUD/CRUDForm";
import useCRUD from "./BaseCRUD/useCRUD";  // Asegúrate de que la importación sea correcta
import "./BaseCRUD.css";

const BaseCRUD = ({ apiUrl, fields, title, initialFormValues }) => {
  const {
    paginatedData,
    actions,
    form,
    sortConfig,
    totalPages,
    currentPage,
  } = useCRUD(apiUrl, fields, initialFormValues);

  return (
    <div className="base-crud-container">
      <h1>{title}</h1>
      <DataTable
        data={paginatedData}
        fields={fields}
        sortConfig={sortConfig}
        onSort={actions.handleSort}
        onEdit={actions.handleEdit}
        onDelete={actions.handleDelete}
        onFilter={actions.handleFilter}  // Agregando el prop onFilter
      />
      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => actions.goToPage(currentPage - 1)}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => actions.goToPage(currentPage + 1)}
        >
          Siguiente
        </button>
      </div>
      <button onClick={actions.fetchItems}>Actualizar Lista</button>
      <button onClick={actions.handleCreate}>Añadir Elemento</button>
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





