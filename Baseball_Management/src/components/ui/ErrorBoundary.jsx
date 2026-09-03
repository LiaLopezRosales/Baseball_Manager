import React from "react";

/**
 * Error Boundary global: captura errores de render y muestra
 * una UI de fallback con opción de reintentar.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__inner">
            <span className="error-boundary__icon" aria-hidden="true">
              ⚠️
            </span>
            <h2>Algo salió mal</h2>
            <p>Ocurrió un error inesperado al renderizar esta sección.</p>
            {this.props.fallback}
            <button
              type="button"
              className="error-boundary__retry"
              onClick={this.handleRetry}
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
