export default function PageState({ loading, error, empty, emptyMessage, onRetry }) {
  if (loading) {
    return (
      <div className="state-panel" role="status">
        <span className="loader" aria-hidden="true" />
        <div>
          <strong>Cargando información</strong>
          <p>EventFlow está consultando los datos del servidor.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-panel state-error" role="alert">
        <span className="state-icon" aria-hidden="true">
          !
        </span>
        <div>
          <strong>No se pudo cargar la información</strong>
          <p>{error}</p>
          {onRetry && (
            <button type="button" className="button button-secondary" onClick={onRetry}>
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="state-panel state-empty">
        <span className="state-icon" aria-hidden="true">
          ○
        </span>
        <div>
          <strong>Sin datos disponibles</strong>
          <p>{emptyMessage || 'Todavía no hay información para mostrar.'}</p>
        </div>
      </div>
    );
  }

  return null;
}

