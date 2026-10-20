import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { announceDataChange, api } from '../services/api.js';
import { EVENT_SAMPLES, EVENT_TYPES } from '../services/constants.js';

const emptyForm = {
  publisherId: '',
  eventType: 'PAYMENT_COMPLETED',
  eventName: EVENT_SAMPLES.PAYMENT_COMPLETED.eventName,
  description: EVENT_SAMPLES.PAYMENT_COMPLETED.description,
  payloadText: JSON.stringify(EVENT_SAMPLES.PAYMENT_COMPLETED.payload, null, 2),
};

export default function PublishPage() {
  const [publishers, setPublishers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState(null);

  const selectedPublisher = useMemo(
    () => publishers.find((publisher) => String(publisher.id) === form.publisherId),
    [publishers, form.publisherId],
  );

  async function loadPublishers() {
    setLoading(true);
    setError('');
    try {
      const response = await api.getPublishers();
      setPublishers(response.data);
      const paymentService = response.data.find(
        (publisher) => publisher.name === 'Payment Service',
      );
      setForm((current) => ({
        ...current,
        publisherId: String(paymentService?.id || response.data[0]?.id || ''),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPublishers();
  }, []);

  function applySample(eventType) {
    const sample = EVENT_SAMPLES[eventType];
    setForm((current) => ({
      ...current,
      eventType,
      eventName: sample.eventName,
      description: sample.description,
      payloadText: JSON.stringify(sample.payload, null, 2),
    }));
  }

  function handlePublisherChange(event) {
    const publisher = publishers.find(
      (item) => String(item.id) === event.target.value,
    );
    setForm((current) => ({ ...current, publisherId: event.target.value }));
    if (publisher) {
      applySample(publisher.defaultEventType);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setResult(null);

    let payload = null;
    if (form.payloadText.trim()) {
      try {
        payload = JSON.parse(form.payloadText);
      } catch {
        setError('El contenido JSON no es válido. Revise comas, llaves y comillas.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await api.publishEvent({
        publisherId: Number(form.publisherId),
        eventType: form.eventType,
        eventName: form.eventName,
        description: form.description,
        payload,
      });
      setResult(response.data);
      setSuccess(response.message);
      announceDataChange();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Publicar un nuevo evento"
        description="El formulario envía el mensaje al backend; el Event Bus determina los receptores sin que el publicador los conozca."
      />

      <PageState loading={loading} error={loading ? '' : error} onRetry={loadPublishers} />

      {!loading && publishers.length > 0 && (
        <div className="two-column-layout publish-layout">
          <form className="card form-card" onSubmit={handleSubmit}>
            <div className="form-section-heading">
              <span className="step-number">1</span>
              <div>
                <h2>Datos del evento</h2>
                <p>Los campos marcados son obligatorios.</p>
              </div>
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span>Publicador *</span>
                <select
                  value={form.publisherId}
                  onChange={handlePublisherChange}
                  required
                >
                  {publishers.map((publisher) => (
                    <option value={publisher.id} key={publisher.id}>
                      {publisher.name}
                    </option>
                  ))}
                </select>
                <small>{selectedPublisher?.description}</small>
              </label>

              <label className="form-field">
                <span>Tipo de evento *</span>
                <select
                  value={form.eventType}
                  onChange={(event) => applySample(event.target.value)}
                  required
                >
                  {EVENT_TYPES.map((eventType) => (
                    <option value={eventType} key={eventType}>
                      {eventType}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field full-width">
                <span>Título o nombre descriptivo *</span>
                <input
                  value={form.eventName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, eventName: event.target.value }))
                  }
                  placeholder="Ejemplo: Pago de matrícula confirmado"
                  required
                />
              </label>

              <label className="form-field full-width">
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
                  required
                />
              </label>

              <label className="form-field full-width">
                <span>Datos adicionales (JSON opcional)</span>
                <textarea
                  className="code-input"
                  value={form.payloadText}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      payloadText: event.target.value,
                    }))
                  }
                  rows="7"
                  spellCheck="false"
                  placeholder='{ "clave": "valor" }'
                />
                <small>Puede dejar este campo vacío. No se envían datos externos.</small>
              </label>
            </div>

            {error && <div className="inline-alert alert-error">{error}</div>}
            {success && <div className="inline-alert alert-success">{success}</div>}

            <button
              className="button button-primary button-large"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Publicando evento…' : 'Publicar en Event Bus →'}
            </button>
          </form>

          <aside className="publish-aside">
            <section className="card route-preview">
              <p className="eyebrow">Vista previa</p>
              <h2>Ruta conceptual</h2>
              <div className="mini-route">
                <span>{selectedPublisher?.name || 'Publicador'}</span>
                <b aria-hidden="true">→</b>
                <span className="mini-bus">Event Bus</span>
                <b aria-hidden="true">→</b>
                <span>Suscriptores</span>
              </div>
              <code>{form.eventType}</code>
            </section>

            {result && (
              <section className="card result-card" aria-live="polite">
                <div className="result-card-header">
                  <div>
                    <p className="eyebrow">Resultado de publicación</p>
                    <h2>Evento #{result.event.id}</h2>
                  </div>
                  <StatusBadge status={result.summary.generalStatus} />
                </div>
                <dl className="summary-list">
                  <div>
                    <dt>Evento publicado</dt>
                    <dd>Sí</dd>
                  </div>
                  <div>
                    <dt>Publicador</dt>
                    <dd>{result.summary.publisher}</dd>
                  </div>
                  <div>
                    <dt>Tipo</dt>
                    <dd>
                      <code>{result.summary.eventType}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>Suscriptores encontrados</dt>
                    <dd>{result.summary.subscribersFound}</dd>
                  </div>
                  <div>
                    <dt>Procesamientos exitosos</dt>
                    <dd>{result.summary.processed}</dd>
                  </div>
                  <div>
                    <dt>Suscriptores inactivos</dt>
                    <dd>{result.summary.inactive}</dd>
                  </div>
                  <div>
                    <dt>Fallos simulados</dt>
                    <dd>{result.summary.failed}</dd>
                  </div>
                </dl>
                <Link className="button button-secondary full-button" to="/bus">
                  Ver distribución en el Bus
                </Link>
              </section>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
