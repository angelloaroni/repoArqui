import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { api } from '../services/api.js';
import { formatDate } from '../services/constants.js';

export default function EventBusPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadLatestEvent() {
    setLoading(true);
    setError('');
    try {
      const listResponse = await api.getEvents({ limit: 1 });
      const latest = listResponse.data[0];
      if (!latest) {
        setEvent(null);
        return;
      }
      const detailResponse = await api.getEvent(latest.id);
      setEvent(detailResponse.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLatestEvent();
    window.addEventListener('eventflow:data-changed', loadLatestEvent);
    return () => window.removeEventListener('eventflow:data-changed', loadLatestEvent);
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        title="Bus de Eventos"
        description="Recorrido del último evento: el bus consulta suscripciones y registra cada resultado de distribución."
        actions={
          <button className="button button-secondary" onClick={loadLatestEvent}>
            Actualizar recorrido
          </button>
        }
      />

      <PageState
        loading={loading}
        error={error}
        empty={!loading && !error && !event}
        emptyMessage="Publique un evento para visualizar su recorrido por el Event Bus."
        onRetry={loadLatestEvent}
      />

      {!loading && !error && event && (
        <>
          <section className="card event-journey">
            <div className="journey-source">
              <span className="flow-label">Publicador</span>
              <div className="journey-node">
                <span className="node-symbol" aria-hidden="true">
                  P
                </span>
                <h3>{event.publisherName}</h3>
                <p>Emite sin conocer receptores</p>
              </div>
            </div>

            <div className="journey-arrow" aria-hidden="true">
              <span />
              <b>PUBLICA</b>
              <span>›</span>
            </div>

            <div className="journey-center">
              <span className="flow-label">Mensaje central</span>
              <article className="event-message-card">
                <div className="event-message-top">
                  <span>EVENTO #{event.id}</span>
                  <StatusBadge status={event.status} />
                </div>
                <code>{event.eventType}</code>
                <h2>{event.eventName}</h2>
                <p>{event.description}</p>
                <dl>
                  <div>
                    <dt>Fecha</dt>
                    <dd>{formatDate(event.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Publicador</dt>
                    <dd>{event.publisherName}</dd>
                  </div>
                </dl>
              </article>
              <div className="bus-core">
                <span className="bus-rings" aria-hidden="true" />
                <div>
                  <small>Canal de distribución</small>
                  <strong>Event Bus</strong>
                  <p>Consulta → enruta → registra</p>
                </div>
              </div>
            </div>

            <div className="journey-arrow" aria-hidden="true">
              <span />
              <b>DISTRIBUYE</b>
              <span>›</span>
            </div>

            <div className="journey-targets">
              <span className="flow-label">Suscriptores</span>
              <div className="target-list">
                {event.distribution.map((delivery) => (
                  <article
                    className={`target-node target-${delivery.status.toLowerCase()}`}
                    key={delivery.subscriberId}
                  >
                    <div>
                      <strong>{delivery.subscriberName}</strong>
                      <small>{delivery.message}</small>
                    </div>
                    <StatusBadge status={delivery.status} />
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="card">
            <div className="section-heading">
              <div>
                <h2>Detalle de distribución</h2>
              </div>
              <span className="count-chip">
                {event.summary.subscribersFound} suscripciones relacionadas
              </span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Suscriptor</th>
                    <th>Estado</th>
                    <th>Mensaje</th>
                    <th>Fecha de procesamiento</th>
                  </tr>
                </thead>
                <tbody>
                  {event.distribution.map((delivery) => (
                    <tr key={delivery.subscriberId}>
                      <td>
                        <strong>{delivery.subscriberName}</strong>
                      </td>
                      <td>
                        <StatusBadge status={delivery.status} />
                      </td>
                      <td>{delivery.message}</td>
                      <td>{formatDate(delivery.processedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
