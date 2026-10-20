import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { announceDataChange, api } from '../services/api.js';

const scenarios = [
  {
    id: 'normal',
    number: '01',
    title: 'Publicación normal',
    eventType: 'PAYMENT_COMPLETED',
    explanation:
      'Payment Service publica y tres suscriptores activos procesan el evento correctamente.',
    initialState:
      'Notification Service, Audit Service y Analytics Service activos y sin fallos.',
    expected: '3 procesados · 0 inactivos · Estado PROCESSED',
  },
  {
    id: 'no-subscribers',
    number: '02',
    title: 'Evento sin suscriptores',
    eventType: 'SYSTEM_UPDATE',
    explanation:
      'El evento se conserva aunque el Event Bus no encuentre servicios interesados.',
    initialState: 'Ningún suscriptor registrado para SYSTEM_UPDATE.',
    expected: '0 encontrados · Sin errores · Estado NO_SUBSCRIBERS',
  },
  {
    id: 'inactive-subscriber',
    number: '03',
    title: 'Suscriptor desconectado',
    eventType: 'USER_REGISTERED',
    explanation:
      'Notification Service se omite por estar inactivo, mientras Audit Service continúa.',
    initialState: 'Notification Service inactivo y Audit Service activo.',
    expected: 'Audit procesado · Notification inactivo · Sin fallo general',
  },
  {
    id: 'new-subscriber',
    number: '04',
    title: 'Incorporación dinámica',
    eventType: 'USER_REGISTERED',
    explanation:
      'Welcome Service se incorpora y recibe el evento sin modificar User Service.',
    initialState: 'Welcome Service activo y suscrito a USER_REGISTERED.',
    expected: 'Welcome Service recibe · Publicador sin cambios',
  },
];

export default function ScenariosPage() {
  const [states, setStates] = useState({});

  function updateState(id, patch) {
    setStates((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }));
  }

  async function prepareScenario(id) {
    updateState(id, { busy: true, error: '', result: null });
    try {
      const response = await api.runScenario(id, 'prepare');
      updateState(id, {
        busy: false,
        prepared: true,
        message: response.message,
      });
      announceDataChange();
    } catch (error) {
      updateState(id, { busy: false, prepared: false, error: error.message });
    }
  }

  async function executeScenario(id) {
    updateState(id, { busy: true, error: '', result: null });
    try {
      const response = await api.runScenario(id, 'execute');
      updateState(id, {
        busy: false,
        message: response.message,
        result: response.data,
      });
      announceDataChange();
    } catch (error) {
      updateState(id, { busy: false, error: error.message });
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Escenarios de demostración"
        description="Prepare cada estado inicial y ejecute eventos controlados para obtener resultados repetibles."
      />

      <div className="scenario-guide">
        <span className="guide-step">1</span>
        <p>
          <strong>Prepare</strong> el estado requerido.
        </p>
        <span aria-hidden="true">→</span>
        <span className="guide-step">2</span>
        <p>
          <strong>Ejecute</strong> el evento.
        </p>
        <span aria-hidden="true">→</span>
        <span className="guide-step">3</span>
        <p>
          <strong>Verifique</strong> Bus e Historial.
        </p>
      </div>

      <section className="scenario-grid">
        {scenarios.map((scenario) => {
          const state = states[scenario.id] || {};
          return (
            <article className="card scenario-card" key={scenario.id}>
              <div className="scenario-top">
                <span className="scenario-number">{scenario.number}</span>
              </div>
              <h2>{scenario.title}</h2>
              <code>{scenario.eventType}</code>
              <p>{scenario.explanation}</p>

              <div className="scenario-requirement">
                <span>Estado inicial requerido</span>
                <strong>{scenario.initialState}</strong>
              </div>
              <div className="scenario-expected">
                <span>Resultado esperado</span>
                <p>{scenario.expected}</p>
              </div>

              <div className="scenario-actions">
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={state.busy}
                  onClick={() => prepareScenario(scenario.id)}
                >
                  {state.prepared ? 'Preparar nuevamente' : 'Preparar escenario'}
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  disabled={state.busy || !state.prepared}
                  onClick={() => executeScenario(scenario.id)}
                  title={!state.prepared ? 'Primero prepare el escenario' : ''}
                >
                  {state.busy ? 'Procesando…' : 'Ejecutar escenario'}
                </button>
              </div>

              {state.message && !state.error && (
                <div className="inline-alert alert-success">{state.message}</div>
              )}
              {state.error && (
                <div className="inline-alert alert-error">{state.error}</div>
              )}

              {state.result && (
                <div className="scenario-result" aria-live="polite">
                  <div className="scenario-result-header">
                    <div>
                      <span>Resultado visible</span>
                      <strong>Evento #{state.result.event.id}</strong>
                    </div>
                    <StatusBadge status={state.result.summary.generalStatus} />
                  </div>
                  <dl>
                    <div>
                      <dt>Encontrados</dt>
                      <dd>{state.result.summary.subscribersFound}</dd>
                    </div>
                    <div>
                      <dt>Procesados</dt>
                      <dd>{state.result.summary.processed}</dd>
                    </div>
                    <div>
                      <dt>Inactivos</dt>
                      <dd>{state.result.summary.inactive}</dd>
                    </div>
                    <div>
                      <dt>Fallidos</dt>
                      <dd>{state.result.summary.failed}</dd>
                    </div>
                  </dl>
                  {state.result.deliveries.length > 0 && (
                    <ul>
                      {state.result.deliveries.map((delivery) => (
                        <li key={delivery.subscriberId}>
                          <span>{delivery.subscriberName}</span>
                          <StatusBadge status={delivery.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="scenario-links">
                <Link to="/bus">Ir al Bus de Eventos →</Link>
                <Link to="/historial">Ir al historial →</Link>
              </div>
            </article>
          );
        })}
      </section>

    </div>
  );
}
