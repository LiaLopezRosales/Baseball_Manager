import React from "react";
import ItemActions from "./ItemActions";

const DataTable = ({ data, fields, sortConfig, onSort, onEdit, onDelete }) => {
  return (
    <div className="item-list">
      <table>
        <thead>
          <tr>
            {fields
              .filter((field) => !field.hidden)
              .map((field) => (
                <th key={field.name} onClick={() => onSort(field.name)}>
                  {field.label}
                  {sortConfig.key === field.name
                    ? sortConfig.direction === "ascending"
                      ? " 🔼"
                      : " 🔽"
                    : null}
                </th>
              ))}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {fields
                .filter((field) => !field.hidden)
                .map((field) => (
                  <td key={field.name}>{item[field.name] || "N/A"}</td>
                ))}
              <td>
                <ItemActions item={item} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
