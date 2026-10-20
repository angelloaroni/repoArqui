import { useState } from "react";
import { api } from "../services/api.js";
import { Icon } from "../components/Icons.jsx";

const simulations = [
  {
    key: "brute",
    title: "Simular fuerza bruta",
    eyebrow: "AUTENTICACIÓN",
    severity: "HIGH",
    description: "Genera cinco intentos fallidos desde el mismo origen y activa la protección automatizada.",
    details: ["Usuario: demo.user", "IP: 192.168.1.50"],
    action: api.simulateBruteForce,
    icon: "events"
  },
  {
    key: "sql",
    title: "Simular SQL Injection",
    eyebrow: "APLICACIÓN WEB",
    severity: "CRITICAL",
    description: "Registra un payload malicioso, crea un incidente crítico y contiene la IP de origen.",
    details: ["Ruta: /api/users", "IP: 10.0.0.25"],
    action: api.simulateSqlInjection,
    icon: "incidents"
  },
  {
    key: "disabled",
    title: "SQL Injection sin Playbook",
    eyebrow: "PRUEBA DE CONTROL",
    severity: "WARNING",
    description: "Desactiva la automatización de SQL Injection y registra el evento sin ejecutar acciones.",
    details: ["Playbook: desactivado", "Respuesta: solo registro"],
    action: api.simulateSqlInjectionDisabled,
    icon: "blocked"
  }
];

export default function SimulatorPage({ onDataChanged, onNavigate }) {
  const [processing, setProcessing] = useState("");
  const [notice, setNotice] = useState(null);

  async function run(simulation) {
    setProcessing(simulation.key);
    setNotice(null);
    try {
      const result = await simulation.action();
      setNotice({ type: result.automated ? "success" : "warning", message: result.message });
      onDataChanged();
    } catch (error) {
      setNotice({ type: "error", message: error.message });
    } finally {
      setProcessing("");
    }
  }

  return (
    <>
      <div className="page-intro">
        <div><h2>Simulador de incidentes</h2><p>Ejecuta escenarios controlados para observar la respuesta de AegisSOAR.</p></div>
        <span className="simulation-safe"><Icon name="shield" size={17} /> Entorno seguro de simulación</span>
      </div>
      {notice && (
        <div className={`notice notice--${notice.type}`}>
          <span className="notice__icon">{notice.type === "success" ? "✓" : notice.type === "warning" ? "!" : "×"}</span>
          <div><strong>{notice.type === "success" ? "Automatización completada" : notice.type === "warning" ? "Automatización omitida" : "No se pudo simular"}</strong><p>{notice.message}</p></div>
          {notice.type !== "error" && <div className="notice__links"><button onClick={() => onNavigate("events")}>Ver eventos</button><button onClick={() => onNavigate("incidents")}>Ver incidentes</button><button onClick={() => onNavigate("blocked")}>Ver bloqueados</button></div>}
        </div>
      )}
      <section className="simulation-grid">
        {simulations.map((simulation, index) => (
          <article className="simulation-card" key={simulation.key}>
            <div className="simulation-card__top">
              <span className={`simulation-number simulation-number--${index + 1}`}>0{index + 1}</span>
              <span className={`badge badge--${simulation.severity.toLowerCase()}`}>{simulation.severity}</span>
            </div>
            <span className="simulation-card__icon"><Icon name={simulation.icon} size={27} /></span>
            <p className="eyebrow">{simulation.eyebrow}</p>
            <h3>{simulation.title}</h3>
            <p>{simulation.description}</p>
            <div className="simulation-details">{simulation.details.map((detail) => <span key={detail}>{detail}</span>)}</div>
            <button className="button button--primary button--full" disabled={Boolean(processing)} onClick={() => run(simulation)}>
              {processing === simulation.key ? <><span className="spinner spinner--small" /> Procesando...</> : <>Ejecutar simulación <Icon name="chevron" size={17} /></>}
            </button>
          </article>
        ))}
      </section>
      <div className="academic-note"><Icon name="shield" size={19} /><div><strong>Simulación académica</strong><p>Las acciones de bloqueo y contención se almacenan únicamente en la base de datos local. No se modifica ningún sistema real.</p></div></div>
    </>
  );
}

