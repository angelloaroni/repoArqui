import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { announceDataChange, api } from '../services/api.js';
import { EVENT_TYPES, formatDate } from '../services/constants.js';

const initialForm = {
  name: '',
  description: '',
  eventTypes: [],
  active: true,
};

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [detailId, setDetailId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  async function loadSubscribers() {
    setLoading(true);
    setError('');
    try {
      const response = await api.getSubscribers();
      setSubscribers(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscribers();
    window.addEventListener('eventflow:data-changed', loadSubscribers);
    return () => window.removeEventListener('eventflow:data-changed', loadSubscribers);
  }, []);

  async function updateSubscriber(id, action) {
    setBusyId(id);
    setError('');
    setFeedback('');
    try {
      const response = await action(id);
      setSubscribers((current) =>
        current.map((subscriber) =>
          subscriber.id === id ? response.data : subscriber,
        ),
      );
      setFeedback(response.message);
      announceDataChange();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId(null);
    }
  }

  function toggleEventType(eventType) {
    setForm((current) => ({
      ...current,
      eventTypes: current.eventTypes.includes(eventType)
        ? current.eventTypes.filter((item) => item !== eventType)
        : [...current.eventTypes, eventType],
    }));
  }

  async function createSubscriber(event) {
    event.preventDefault();
    setCreating(true);
    setError('');
    setFeedback('');
    try {
      const response = await api.createSubscriber(form);
      setSubscribers((current) => [...current, response.data]);
      setForm(initialForm);
      setFeedback(response.message);
      setDetailId(response.data.id);
      announceDataChange();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Gestión de suscriptores"
        description="Active, desconecte o amplíe los receptores sin cambiar la implementación de ningún publicador."
        actions={<span className="count-chip">{subscribers.length} suscriptores</span>}
      />

      {feedback && <div className="inline-alert alert-success">{feedback}</div>}
      <PageState loading={loading} error={error} onRetry={loadSubscribers} />

      {!loading && (
        <section className="subscriber-grid">
          {subscribers.map((subscriber) => (
            <article
              className={`card subscriber-card ${!subscriber.active ? 'subscriber-inactive' : ''}`}
              key={subscriber.id}
            >
              <div className="subscriber-card-top">
                <span className="subscriber-avatar" aria-hidden="true">
                  {subscriber.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <div>
                  <h2>{subscriber.name}</h2>
                  <StatusBadge status={subscriber.active ? 'ACTIVE' : 'INACTIVE'} />
                </div>
              </div>

              <p>{subscriber.description}</p>
              <div className="subscriber-metric">
                <span>Eventos procesados</span>
                <strong>{subscriber.eventsProcessed}</strong>
              </div>
              <div className="tag-list">
                {subscriber.eventTypes.map((eventType) => (
                  <code key={eventType}>{eventType}</code>
                ))}
              </div>

              {subscriber.simulateFailure && (
                <div className="failure-notice">
                  <strong>Fallo controlado activo</strong>
                  <span>La próxima entrega compatible quedará como FAILED.</span>
                </div>
              )}

              <div className="card-actions">
                <button
                  type="button"
                  className={subscriber.active ? 'button button-danger' : 'button button-primary'}
                  disabled={busyId === subscriber.id}
                  onClick={() => updateSubscriber(subscriber.id, api.toggleSubscriber)}
                >
                  {subscriber.active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={busyId === subscriber.id}
                  onClick={() => updateSubscriber(subscriber.id, api.toggleFailure)}
                >
                  {subscriber.simulateFailure ? 'Quitar fallo' : 'Simular fallo'}
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() =>
                    setDetailId((current) =>
                      current === subscriber.id ? null : subscriber.id,
                    )
                  }
                >
                  {detailId === subscriber.id ? 'Ocultar detalle' : 'Ver detalle'}
                </button>
              </div>

              {detailId === subscriber.id && (
                <div className="subscriber-detail">
                  <dl>
                    <div>
                      <dt>Estado operativo</dt>
                      <dd>{subscriber.active ? 'Activo' : 'Inactivo'}</dd>
                    </div>
                    <div>
                      <dt>Creado</dt>
                      <dd>{formatDate(subscriber.createdAt)}</dd>
                    </div>
                    <div>
                      <dt>Suscripciones</dt>
                      <dd>{subscriber.eventTypes.length}</dd>
                    </div>
                    <div>
                      <dt>Fallo configurado</dt>
                      <dd>{subscriber.simulateFailure ? 'Sí' : 'No'}</dd>
                    </div>
                  </dl>
                  <p>
                    El historial de entregas procesadas se mantiene aunque el servicio
                    sea desactivado.
                  </p>
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      <section className="card subscriber-form-section">
        <div className="subscriber-form-intro">
          <h2>Incorporar un nuevo suscriptor</h2>
          <p>
            El nuevo suscriptor fue incorporado sin modificar la lógica del
            publicador, demostrando la modificabilidad y el bajo acoplamiento del
            patrón.
          </p>
          <div className="decoupling-visual" aria-hidden="true">
            <span>Publicador</span>
            <b>sin cambios</b>
            <span>＋ Suscriptor</span>
          </div>
        </div>

        <form className="subscriber-form" onSubmit={createSubscriber}>
          <label className="form-field">
            <span>Nombre *</span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Ejemplo: Welcome Service"
              required
            />
          </label>
          <label className="form-field">
            <span>Descripción *</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows="3"
              placeholder="Responsabilidad del nuevo servicio"
              required
            />
          </label>
          <fieldset className="event-type-fieldset">
            <legend>Tipos de eventos que recibirá *</legend>
            <div className="checkbox-grid">
              {EVENT_TYPES.map((eventType) => (
                <label className="checkbox-option" key={eventType}>
                  <input
                    type="checkbox"
                    checked={form.eventTypes.includes(eventType)}
                    onChange={() => toggleEventType(eventType)}
                  />
                  <code>{eventType}</code>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="switch-field">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm((current) => ({ ...current, active: event.target.checked }))
              }
            />
            <span>Crear como suscriptor activo</span>
          </label>
          <button
            className="button button-primary button-large"
            type="submit"
            disabled={creating}
          >
            {creating ? 'Incorporando…' : 'Incorporar suscriptor'}
          </button>
        </form>
      </section>
    </div>
  );
}
