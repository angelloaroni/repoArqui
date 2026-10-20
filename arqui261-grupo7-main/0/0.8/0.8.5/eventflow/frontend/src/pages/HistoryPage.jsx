import { useEffect, useState } from 'react';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { api } from '../services/api.js';
import { EVENT_TYPES, formatDate } from '../services/constants.js';

const initialFilters = {
  eventType: '',
  publisherId: '',
  status: '',
  search: '',
};

export default function HistoryPage() {
  const [events, setEvents] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadHistory(nextFilters = appliedFilters) {
    setLoading(true);
    setError('');
    try {
      const response = await api.getHistory(nextFilters);
      setEvents(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function initialize() {
      try {
        const response = await api.getPublishers();
        setPublishers(response.data);
      } catch {
      }
      loadHistory(initialFilters);
    }
    initialize();
  }, []);

  useEffect(() => {
    function refresh() {
      loadHistory(appliedFilters);
    }
    window.addEventListener('eventflow:data-changed', refresh);
    return () => window.removeEventListener('eventflow:data-changed', refresh);
  }, [appliedFilters]);

  function submitFilters(event) {
    event.preventDefault();
    setAppliedFilters(filters);
    loadHistory(filters);
  }

  function clearFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    loadHistory(initialFilters);
  }

  async function openDetail(id) {
    setDetail({ id });
    setDetailLoading(true);
    try {
      const response = await api.getEvent(id);
      setDetail(response.data);
    } catch (requestError) {
      setDetail({ id, error: requestError.message });
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Historial de eventos"
        description="Consulte eventos persistidos y el resultado individual de cada entrega."
        actions={<span className="count-chip">{events.length} resultados</span>}
      />

      <form className="card filter-panel" onSubmit={submitFilters}>
        <label className="form-field">
          <span>Tipo de evento</span>
          <select
            value={filters.eventType}
            onChange={(event) =>
              setFilters((current) => ({ ...current, eventType: event.target.value }))
            }
          >
            <option value="">Todos los tipos</option>
            {EVENT_TYPES.map((eventType) => (
              <option key={eventType}>{eventType}</option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Publicador</span>
          <select
            value={filters.publisherId}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                publisherId: event.target.value,
              }))
            }
          >
            <option value="">Todos los publicadores</option>
            {publishers.map((publisher) => (
              <option value={publisher.id} key={publisher.id}>
                {publisher.name}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Estado general</span>
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
          >
            <option value="">Todos los estados</option>
            <option value="PROCESSED">Procesado</option>
            <option value="PARTIALLY_PROCESSED">Procesado parcialmente</option>
            <option value="NO_SUBSCRIBERS">Publicado sin suscriptores</option>
            <option value="FAILED">Fallido</option>
          </select>
        </label>

        <label className="form-field search-field">
          <span>Buscar texto</span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({ ...current, search: event.target.value }))
            }
            placeholder="Nombre, descripción o servicio"
          />
        </label>

        <div className="filter-actions">
          <button className="button button-primary" type="submit">
            Aplicar filtros
          </button>
          <button className="button button-ghost" type="button" onClick={clearFilters}>
            Limpiar
          </button>
        </div>
      </form>

      <PageState
        loading={loading}
        error={error}
        empty={!loading && !error && events.length === 0}
        emptyMessage="No existen eventos que coincidan con los filtros seleccionados."
        onRetry={() => loadHistory(appliedFilters)}
      />

      {!loading && !error && events.length > 0 && (
        <section className="card history-card">
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Evento</th>
                  <th>Publicador</th>
                  <th>Fecha y hora</th>
                  <th>Encontrados</th>
                  <th>Exitosos</th>
                  <th>Inactivos</th>
                  <th>Estado general</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className="event-id">#{event.id}</span>
                    </td>
                    <td>
                      <strong>{event.eventName}</strong>
                      <code>{event.eventType}</code>
                    </td>
                    <td>{event.publisherName}</td>
                    <td>{formatDate(event.createdAt)}</td>
                    <td>{event.subscribersFound}</td>
                    <td>{event.processed}</td>
                    <td>{event.inactive}</td>
                    <td>
                      <StatusBadge status={event.status} />
                    </td>
                    <td>
                      <button
                        className="button button-ghost button-small"
                        type="button"
                        onClick={() => openDetail(event.id)}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {detail && (
        <Modal
          title={detail.eventName || `Evento #${detail.id}`}
          onClose={() => setDetail(null)}
        >
          {detailLoading && <PageState loading />}
          {!detailLoading && detail.error && <PageState error={detail.error} />}
          {!detailLoading && !detail.error && detail.eventName && (
            <div className="event-detail">
              <div className="detail-summary">
                <div>
                  <span>ID</span>
                  <strong>#{detail.id}</strong>
                </div>
                <div>
                  <span>Tipo</span>
                  <code>{detail.eventType}</code>
                </div>
                <div>
                  <span>Publicador</span>
                  <strong>{detail.publisherName}</strong>
                </div>
                <div>
                  <span>Estado</span>
                  <StatusBadge status={detail.status} />
                </div>
              </div>
              <div className="detail-copy">
                <p>{detail.description}</p>
                <span>{formatDate(detail.createdAt)}</span>
              </div>
              <div>
                <h3>Contenido del evento</h3>
                <pre>{JSON.stringify(detail.payload, null, 2) || 'Sin datos adicionales'}</pre>
              </div>
              <div>
                <h3>Resultados individuales</h3>
                <div className="delivery-list">
                  {detail.deliveries.length === 0 && (
                    <p className="muted-text">
                      Este evento fue publicado sin suscriptores.
                    </p>
                  )}
                  {detail.deliveries.map((delivery) => (
                    <article key={delivery.id}>
                      <div>
                        <strong>{delivery.subscriberName}</strong>
                        <p>{delivery.message}</p>
                        <small>{formatDate(delivery.processedAt)}</small>
                      </div>
                      <StatusBadge status={delivery.status} />
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
