import { useEffect, useState } from 'react';
import BarList from '../components/BarList.jsx';
import PageHeader from '../components/PageHeader.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { api } from '../services/api.js';
import { formatDate, statusLabel } from '../services/constants.js';

const metricDefinitions = [
  { key: 'totalEvents', label: 'Eventos publicados', icon: 'E' },
  { key: 'totalDeliveries', label: 'Procesamientos totales', icon: 'D' },
  { key: 'totalPublishers', label: 'Publicadores', icon: 'P' },
  { key: 'totalSubscribers', label: 'Suscriptores', icon: 'S' },
  { key: 'activeSubscribers', label: 'Suscriptores activos', icon: 'A' },
  { key: 'inactiveSubscribers', label: 'Suscriptores inactivos', icon: 'I' },
  { key: 'processedDeliveries', label: 'Entregas exitosas', icon: '✓' },
  { key: 'noSubscriberEvents', label: 'Eventos sin suscriptores', icon: '0' },
];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const response = await api.getDashboard();
      setDashboard(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    window.addEventListener('eventflow:data-changed', loadDashboard);
    return () => window.removeEventListener('eventflow:data-changed', loadDashboard);
  }, []);

  const translatedStatusSummary =
    dashboard?.statusSummary.map((item) => ({
      ...item,
      label: statusLabel(item.label),
    })) || [];

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard principal"
        description="Indicadores calculados desde los eventos y entregas almacenados en SQLite."
        actions={
          <button className="button button-secondary" onClick={loadDashboard}>
            Actualizar indicadores
          </button>
        }
      />

      <PageState loading={loading} error={error} onRetry={loadDashboard} />

      {!loading && !error && dashboard && (
        <>
          <section className="metrics-grid">
            {metricDefinitions.map((metric) => (
              <article className="metric-card" key={metric.key}>
                <span className="metric-icon" aria-hidden="true">
                  {metric.icon}
                </span>
                <div>
                  <strong>{dashboard.totals[metric.key]}</strong>
                  <span>{metric.label}</span>
                </div>
              </article>
            ))}
          </section>

          <section className="dashboard-grid">
            <article className="card chart-card">
              <div className="section-heading compact-heading">
                <div>
                  <h2>Eventos por tipo</h2>
                </div>
              </div>
              <BarList items={dashboard.eventsByType} />
            </article>

            <article className="card chart-card">
              <div className="section-heading compact-heading">
                <div>
                  <h2>Eventos por publicador</h2>
                </div>
              </div>
              <BarList items={dashboard.eventsByPublisher} />
            </article>

            <article className="card chart-card">
              <div className="section-heading compact-heading">
                <div>
                  <h2>Suscriptores con más procesamientos</h2>
                </div>
              </div>
              <BarList items={dashboard.topSubscribers} />
            </article>

            <article className="card chart-card">
              <div className="section-heading compact-heading">
                <div>
                  <h2>Resumen de estados</h2>
                </div>
              </div>
              <BarList
                items={translatedStatusSummary}
                emptyMessage="Aún no hay estados registrados."
              />
            </article>
          </section>

          <section className="card">
            <div className="section-heading">
              <div>
                <h2>Eventos recientes</h2>
              </div>
              <span className="count-chip">Últimos 5</span>
            </div>
            {dashboard.recentEvents.length === 0 ? (
              <PageState
                empty
                emptyMessage="Use «Cargar datos de ejemplo» para poblar el Dashboard."
              />
            ) : (
              <div className="recent-event-list">
                {dashboard.recentEvents.map((event) => (
                  <article key={event.id}>
                    <span className="recent-event-index">#{event.id}</span>
                    <div>
                      <strong>{event.eventName}</strong>
                      <span>
                        {event.publisherName} · {formatDate(event.createdAt)}
                      </span>
                    </div>
                    <code>{event.eventType}</code>
                    <StatusBadge status={event.status} />
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
