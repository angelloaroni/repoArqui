import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import PageState from '../components/PageState.jsx';
import { api } from '../services/api.js';

const concepts = [
  {
    number: '01',
    title: 'Publicador',
    text: 'Genera un evento y lo entrega al bus sin conocer quién lo procesará.',
  },
  {
    number: '02',
    title: 'Bus de Eventos',
    text: 'Recibe el mensaje, consulta suscripciones y coordina su distribución.',
  },
  {
    number: '03',
    title: 'Suscriptor',
    text: 'Declara los tipos de evento que le interesan y procesa solo esos mensajes.',
  },
  {
    number: '04',
    title: 'Desacoplamiento',
    text: 'Permite incorporar o retirar receptores sin cambiar la lógica del publicador.',
  },
];

const diagramPublishers = ['User Service', 'Payment Service', 'Order Service'];
const diagramSubscribers = [
  'Notification Service',
  'Audit Service',
  'Analytics Service',
  'Security Service',
];

export default function HomePage() {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadPublishers() {
    setLoading(true);
    setError('');
    try {
      const response = await api.getPublishers();
      setPublishers(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPublishers();
  }, []);

  return (
    <div className="page-stack">
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>EventFlow</h1>
          <h2>Simulador del patrón Publicador-Suscriptor</h2>
          <p>
            Observe cómo los servicios publican eventos sin depender de sus receptores y
            cómo el Event Bus distribuye cada mensaje según suscripciones configurables.
          </p>
          <div className="hero-points">
            <span>✓ Distribución visible</span>
            <span>✓ Datos persistentes</span>
            <span>✓ Escenarios repetibles</span>
          </div>
        </div>
        <div className="hero-summary" aria-label="Resumen del flujo">
          <span className="summary-index">PUB / SUB</span>
          <strong>Un evento.</strong>
          <strong>Varios receptores.</strong>
          <p>Acoplamiento mínimo entre servicios.</p>
        </div>
      </section>

      <section className="card architecture-card">
        <PageHeader
          title="Recorrido conceptual de un evento"
        />
        <div className="architecture-flow">
          <div className="architecture-column">
            <span className="flow-label">Publicadores</span>
            {diagramPublishers.map((name) => (
              <div className="service-node publisher-node" key={name}>
                <span aria-hidden="true">P</span>
                <strong>{name}</strong>
              </div>
            ))}
          </div>

          <div className="flow-connector" aria-hidden="true">
            <span />
            <b>EVENTO</b>
            <span />
          </div>

          <div className="event-bus-node">
            <span className="bus-pulse" aria-hidden="true" />
            <small>Canal central</small>
            <strong>Event Bus</strong>
            <p>Consulta y distribuye</p>
          </div>

          <div className="flow-connector" aria-hidden="true">
            <span />
            <b>RUTEO</b>
            <span />
          </div>

          <div className="architecture-column">
            <span className="flow-label">Suscriptores</span>
            {diagramSubscribers.map((name) => (
              <div className="service-node subscriber-node" key={name}>
                <span aria-hidden="true">S</span>
                <strong>{name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <PageHeader
          title="¿Cómo funciona el patrón?"
        />
        <div className="concept-grid">
          {concepts.map((concept) => (
            <article className="concept-card" key={concept.number}>
              <span>{concept.number}</span>
              <h3>{concept.title}</h3>
              <p>{concept.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Publicadores disponibles</h2>
          </div>
          <span className="count-chip">{publishers.length || 6} servicios</span>
        </div>
        <PageState loading={loading} error={error} onRetry={loadPublishers} />
        {!loading && !error && (
          <div className="publisher-grid">
            {publishers.map((publisher) => (
              <article className="publisher-card" key={publisher.id}>
                <span className="publisher-initial" aria-hidden="true">
                  {publisher.name.charAt(0)}
                </span>
                <div>
                  <h3>{publisher.name}</h3>
                  <code>{publisher.defaultEventType}</code>
                  <p>{publisher.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
