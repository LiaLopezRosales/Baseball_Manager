import { useState, useEffect, useCallback } from "react";

const useCRUD = (apiUrl, fields, initialFormValues) => {
  const [rawData, setRawData] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ 
    key: null, 
    direction: "ascending" 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [personData, setPersonData] = useState({});

  // Estados del formulario
  const [formValues, setFormValues] = useState(initialFormValues);
  const [formErrors, setFormErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // Obtener datos principales
  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setRawData(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [apiUrl]);

  // Carga inicial de datos
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Obtener datos de personas relacionadas
  const fetchPersonData = useCallback(async (P_id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/persons/${P_id}/`);
      if (response.ok) {
        const person = await response.json();
        setPersonData(prev => ({ ...prev, [P_id]: person }));
      }
    } catch (error) {
      console.error("Error fetching person data:", error);
    }
  }, []);

  // Cargar solo IDs de personas no existentes
  useEffect(() => {
    if (fields.some(f => f.name === "P_id")) {
      const newPersonIds = rawData
        .map(item => item.P_id)
        .filter(id => id && !personData[id]);
      
      newPersonIds.forEach(id => {
        fetchPersonData(id);
      });
    }
  }, [rawData, personData, fetchPersonData, fields]);

  // Procesar datos (filtrado y ordenamiento)
  const processedData = useCallback(() => {
    let result = [...rawData];

    // Ordenamiento
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === null) return 1;
        if (bVal === null) return -1;
        
        if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    // Filtrado unificado
    result = result.filter(item => {
      return Object.entries(filters).every(([fieldName, filter]) => {
        const field = fields.find(f => f.name === fieldName);
        if (!field || !filter) return true;

        // Filtro para relaciones (P_id)
        if (fieldName === "P_id") {
          const person = personData[item.P_id] || {};
          const searchText = (filter.search || "").toLowerCase();
          return (
            person.name?.toLowerCase().includes(searchText) ||
            person.lastname?.toLowerCase().includes(searchText)
          );
        }

        // Filtros estándar
        const value = item[fieldName];
        
        if (field.type === "number") {
          const min = parseFloat(filter.min || -Infinity);
          const max = parseFloat(filter.max || Infinity);
          return value >= min && value <= max;
        }

        if (field.type === "date") {
          const date = new Date(value);
          const start = new Date(filter.start || "1970-01-01");
          const end = new Date(filter.end || "2100-01-01");
          return date >= start && date <= end;
        }

        if (field.type === "text" || field.type === "email") {
          const searchText = (filter.search || "").toLowerCase();
          return value?.toString().toLowerCase().includes(searchText);
        }

        return true;
      });
    });

    return result;
  }, [rawData, sortConfig, filters, fields, personData]);

  // Datos paginados
  const totalItems = processedData().length;
  const totalPages = Math.ceil(totalItems / 10) || 1;
  const paginatedData = processedData().slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  // Handlers CRUD
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormValues(initialFormValues);
    setFormErrors({});
  };

  const handleEdit = (item) => {
    const values = fields.reduce((acc, field) => {
      acc[field.name] = item[field.name] ?? (field.nullable ? "" : null);
      return acc;
    }, {});
    
    setIsEditing(true);
    setCurrentItem(item);
    setFormValues(values);
    setFormErrors({});
  };

  const handleSave = async () => {
    const isEdit = !!currentItem?.id;
    const url = isEdit 
      ? `${apiUrl}${currentItem.id}/`
      : apiUrl;

    try {
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchItems();
        setIsCreating(false);
        setIsEditing(false);
        setFormErrors({});
      } else {
        setFormErrors(data.errors || { detail: data.detail || "Error desconocido" });
      }
    } catch (error) {
      console.error("Error:", error);
      setFormErrors({ detail: "Error de conexión" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este elemento?")) {
      try {
        const response = await fetch(`${apiUrl}${id}/`, { 
          method: "DELETE" 
        });
        
        if (response.ok) {
          await fetchItems();
        } else {
          console.error("Error deleting item:", response.status);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setFormErrors({});
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "ascending" 
        ? "descending" 
        : "ascending"
    }));
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const goToPage = (page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  return {
    paginatedData,
    totalPages,
    currentPage,
    sortConfig,
    personData,
    form: { 
      values: formValues, 
      errors: formErrors, 
      isCreating, 
      isEditing 
    },
    actions: {
      fetchItems,
      handleCreate,
      handleEdit,
      handleSave,
      handleDelete,
      handleCancel,
      handleInputChange,
      handleSort,
      handleFilter,
      goToPage
    }
  };
};

export default useCRUD;