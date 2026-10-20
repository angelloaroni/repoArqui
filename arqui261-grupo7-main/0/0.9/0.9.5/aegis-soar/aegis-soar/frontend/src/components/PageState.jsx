export default function PageState({ loading, error, children }) {
  if (loading) {
    return <div className="state-card"><span className="spinner" /> Cargando información...</div>;
  }
  if (error) {
    return <div className="state-card state-card--error"><strong>Sin conexión</strong><span>{error}</span></div>;
  }
  return children;
}

