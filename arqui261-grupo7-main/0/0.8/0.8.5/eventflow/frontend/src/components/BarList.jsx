export default function BarList({ items, emptyMessage = 'Sin datos para representar.' }) {
  if (!items?.length) {
    return <p className="muted-text">{emptyMessage}</p>;
  }

  const maximum = Math.max(...items.map((item) => Number(item.value)), 1);

  return (
    <div className="bar-list">
      {items.map((item) => (
        <div className="bar-item" key={item.label}>
          <div className="bar-label">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
          <div className="bar-track" aria-hidden="true">
            <span style={{ width: `${(Number(item.value) / maximum) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

