import React from "react";

/**
 * Spinner de carga estilo "Premium React Loaders" (GradientSpinner).
 * Puro CSS, sin dependencias.
 */
export default function GradientSpinner({ size = 48, label = 'Cargando…' }) {
  return (
    <div className="gradient-spinner" role="status" aria-live="polite">
      <span
        className="gradient-spinner__ring"
        style={{ width: size, height: size }}
      />
      {label && <span className="gradient-spinner__label">{label}</span>}
    </div>
  );
}
