import { statusLabel } from '../services/constants.js';

export default function StatusBadge({ status }) {
  const normalized = (status || 'UNKNOWN').toLowerCase().replaceAll('_', '-');
  return (
    <span className={`status-badge status-${normalized}`}>
      <span aria-hidden="true" className="status-dot" />
      {statusLabel(status)}
    </span>
  );
}

