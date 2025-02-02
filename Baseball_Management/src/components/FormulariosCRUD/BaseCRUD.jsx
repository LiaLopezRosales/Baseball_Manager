import React from "react";
import DataTable from "./BaseCRUD/DataTable"; // Importa el componente DataTable
import CRUDForm from "./BaseCRUD/CRUDForm"; // Importa el componente CRUDForm
import useCRUD from "./BaseCRUD/useCRUD"; // Importa el hook personalizado useCRUD
import "./BaseCRUD.css"; // Importa los estilos CSS

// Componente BaseCRUD
const BaseCRUD = ({ apiUrl, fields, title, initialFormValues }) => {
  // Usa el hook useCRUD para manejar la lógica de CRUD
  const {
    paginatedData, // Datos paginados para mostrar en la tabla
    actions, // Funciones para manejar acciones (crear, editar, eliminar, etc.)
    form, // Estado del formulario (valores, errores, si está en modo creación/edición)
    sortConfig, // Configuración de ordenación (clave y dirección)
    totalPages, // Número total de páginas
    currentPage, // Página actual
  } = useCRUD(apiUrl, fields, initialFormValues);

  return (
    <div className="base-crud-container">
      {/* Título del CRUD */}
      <h1>{title}</h1>

      {/* Tabla de datos */}
      <DataTable
        data={paginatedData} // Datos paginados
        fields={fields} // Campos de la tabla
        sortConfig={sortConfig} // Configuración de ordenación
        onSort={actions.handleSort} // Función para manejar la ordenación
        onEdit={actions.handleEdit} // Función para manejar la edición
        onDelete={actions.handleDelete} // Función para manejar la eliminación
        onFilter={actions.handleFilter} // Función para manejar el filtrado
      />

      {/* Controles de paginación */}
      <div className="pagination-controls">
        <button
          disabled={currentPage === 1} // Deshabilita el botón si estamos en la primera página
          onClick={() => actions.goToPage(currentPage - 1)} // Va a la página anterior
        >
          Anterior
        </button>
        <span style={{marginRight: 10, marginLeft: 10}}>
          Página {currentPage} de {totalPages} {/* Muestra la página actual y el total */}
        </span>
        <button
          disabled={currentPage === totalPages} // Deshabilita el botón si estamos en la última página
          onClick={() => actions.goToPage(currentPage + 1)} // Va a la página siguiente
        >
          Siguiente
        </button>
      </div>

      {/* Botones para actualizar la lista y añadir un nuevo elemento */}
      <button className="refresh-button" onClick={actions.fetchItems}>Actualizar Lista</button>
      <button className="add-button" onClick={actions.handleCreate}>Añadir Elemento</button>

      {/* Formulario CRUD (se muestra solo en modo creación o edición) */}
      {(form.isCreating || form.isEditing) && (
        <CRUDForm
          fields={fields} // Campos del formulario
          formValues={form.values} // Valores actuales del formulario
          formErrors={form.errors} // Errores de validación del formulario
          onChange={actions.handleInputChange} // Función para manejar cambios en los inputs
          onSave={actions.handleSave} // Función para guardar el formulario
          onCancel={actions.handleCancel} // Función para cancelar el formulario
        />
      )}
    </div>
  );
};

export default BaseCRUD; // Exporta el componente BaseCRUD