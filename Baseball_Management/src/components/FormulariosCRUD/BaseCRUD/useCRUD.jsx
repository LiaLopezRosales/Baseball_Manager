/* Baseball_Management/src/components/FormulariosCRUD/BaseCRUD/useCRUD.jsx */

import { useState, useEffect, useMemo, useCallback } from "react";

const useCRUD = (apiUrl, fields, initialFormValues, pageSizeDefault = 10) => {
  const [rawData, setRawData] = useState([]);
  const [filters, setFilters] = useState({});
  const [globalSearch, setGlobalSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [pageSize, setPageSize] = useState(pageSizeDefault);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [formValues, setFormValues] = useState(initialFormValues);
  const [formErrors, setFormErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const fieldsVisible = useMemo(
    () => fields.filter((f) => !f.hidden && f.type !== "password"),
    [fields]
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const rawData = await response.json();
        setRawData(Array.isArray(rawData) ? rawData : []);
      } else {
        console.error(`Error fetching data (${apiUrl}): HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ── Filtrado + orden --------------------------------
  const filteredData = useMemo(() => {
    let rows = rawData;

    rows = rows.filter((item) =>
      Object.entries(filters).every(([key, filter]) => {
        if (!filter) return true;
        const field = fields.find((f) => f.name === key);
        if (!field) return true;
        const fieldValue = item[key];

        if (field.type === "number") {
          const minValid = filter.min ? Number(fieldValue) >= parseFloat(filter.min) : true;
          const maxValid = filter.max ? Number(fieldValue) <= parseFloat(filter.max) : true;
          return minValid && maxValid;
        }

        if (field.type === "date") {
          const dateValue = new Date(fieldValue);
          const startValid = filter.start ? dateValue >= new Date(filter.start) : true;
          const endValid = filter.end ? dateValue <= new Date(filter.end) : true;
          return startValid && endValid;
        }

        if (filter.search) {
          const display =
            field.type === "select" && field.options
              ? (field.options.find((o) => String(o.id) === String(fieldValue))?.name ??
                String(fieldValue ?? ""))
              : String(fieldValue ?? "");
          return display.toLowerCase().includes(filter.search.toLowerCase());
        }

        return true;
      })
    );

    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      rows = rows.filter((item) =>
        fieldsVisible.some((field) => {
          const raw = item[field.name];
          if (raw === null || raw === undefined) return false;
          if (field.type === "select" && field.options) {
            return (field.options.find((o) => String(o.id) === String(raw))?.name ?? "")
              .toLowerCase()
              .includes(q);
          }
          return String(raw).toLowerCase().includes(q);
        })
      );
    }

    if (quickFilter && quickFilter.fn) {
      rows = rows.filter(quickFilter.fn);
    }

    if (sortConfig.key) {
      rows = [...rows].sort((a, b) => {
        const va = a[sortConfig.key];
        const vb = b[sortConfig.key];
        if (va < vb) return sortConfig.direction === "ascending" ? -1 : 1;
        if (va > vb) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [rawData, fields, fieldsVisible, filters, globalSearch, quickFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ── Formulario --------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormValues(initialFormValues);
    setFormErrors({});
  };

  const handleEdit = (item) => {
    const updatedFormValues = {};
    fields.forEach((field) => {
      updatedFormValues[field.name] =
        item[field.name] !== null && item[field.name] !== undefined
          ? item[field.name]
          : field.nullable
          ? ""
          : item[field.name];
    });
    setIsEditing(true);
    setCurrentItem(item);
    setFormValues(updatedFormValues);
    setFormErrors({});
  };

  const handleSave = async () => {
    const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const url = isEditing ? `${baseUrl}/${currentItem.id}/` : apiUrl;
    const method = isEditing ? "PUT" : "POST";
    const filteredFormValues = Object.fromEntries(
      Object.entries(formValues).filter(
        ([key]) => !fields.find((field) => field.name === key && field.autoGenerated)
      )
    );
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filteredFormValues),
      });

      const responseData = await response.json();

      if (response.ok) {
        fetchItems(); // Refrescar datos
        setIsEditing(false);
        setIsCreating(false);
        setCurrentItem(null);
        setFormErrors({});
      } else {
        if (responseData.errors) setFormErrors(responseData.errors);
        if (responseData.detail) setFormErrors({ detail: responseData.detail });
        if (!responseData.errors && !responseData.detail) {
          alert("Ocurrió un error inesperado.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este elemento?")) {
      try {
        const response = await fetch(`${apiUrl}${itemId}/`, { method: "DELETE" });
        if (response.ok) {
          fetchItems(); // Refrescar datos
        } else {
          console.error("Error deleting item");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleBulkDelete = async (ids) => {
    const list = Array.from(ids || []);
    if (list.length === 0) return false;
    if (
      !window.confirm(
        `¿Eliminar ${list.length} registro(s) seleccionado(s)? Esta acción no se puede deshacer.`
      )
    ) {
      return false;
    }
    const results = await Promise.all(
      list.map(async (id) => {
        try {
          const response = await fetch(`${apiUrl}${id}/`, { method: "DELETE" });
          return response.ok;
        } catch (error) {
          console.error("Error deleting item", id, error);
          return false;
        }
      })
    );
    const failed = results.filter((ok) => !ok).length;
    fetchItems(); // Refrescar datos
    if (failed > 0) {
      alert(`No se pudieron eliminar ${failed} de ${list.length} registro(s).`);
    }
    return true;
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setCurrentItem(null);
    setFormErrors({});
  };

  // ── Filtros ------------------------------------------
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleGlobalSearch = (query) => {
    setGlobalSearch(query);
    setCurrentPage(1);
  };

  const handleQuickFilter = (qs) => {
    setQuickFilter(qs ? { label: qs.label, fn: qs.fn } : null);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setGlobalSearch("");
    setQuickFilter(null);
    setCurrentPage(1);
  };

  const setPage = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    data: rawData,
    filteredData,
    paginatedData,
    totalPages,
    currentPage,
    pageSize,
    loading,
    fieldsVisible,
    filters,
    globalSearch,
    quickFilter,
    sortConfig,
    form: { values: formValues, errors: formErrors, isEditing, isCreating },
    actions: {
      fetchItems,
      handleCreate,
      handleEdit,
      handleSave,
      handleDelete,
      handleBulkDelete,
      handleCancel,
      handleInputChange,
      handleSort,
      handleFilter,
      handleGlobalSearch,
      handleQuickFilter,
      clearFilters,
      setPage,
      goToPage,
    },
  };
};

export default useCRUD;