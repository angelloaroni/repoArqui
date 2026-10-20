import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import PageState from "../components/PageState.jsx";
import Badge from "../components/Badge.jsx";
import DataTable from "../components/DataTable.jsx";
import { Icon } from "../components/Icons.jsx";

const statConfig = [
  ["events", "Total de eventos", "events", "blue"],
  ["incidents", "Total de incidentes", "incidents", "orange"],
  ["playbooksExecuted", "Playbooks ejecutados", "playbooks", "violet"],
  ["blockedUsers", "Usuarios bloqueados", "blocked", "cyan"],
  ["blockedIps", "IP bloqueadas", "blocked", "indigo"],
  ["criticalIncidents", "Incidentes críticos", "incidents", "red"]
];

const formatDate = (value) => value ? new Date(`${value.replace(" ", "T")}Z`).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" }) : "—";

export default function DashboardPage({ refreshKey, onNavigate }) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: "" }));
    api.dashboard()
      .then((data) => active && setState({ data, loading: false, error: "" }))
      .catch((error) => active && setState({ data: null, loading: false, error: error.message }));
    return () => { active = false; };
  }, [refreshKey]);

  const eventColumns = [
    { key: "type", label: "Evento", render: (value) => <span className="event-name"><span className="event-dot" />{value}</span> },
    { key: "ip_address", label: "Origen" },
    { key: "result", label: "Resultado", render: (value) => <Badge variant={value === "Incidente generado" ? "generated" : "registered"}>{value}</Badge> },
    { key: "created_at", label: "Fecha", render: formatDate }
  ];
  const incidentColumns = [
    { key: "id", label: "ID", render: (value) => `INC-${String(value).padStart(4, "0")}` },
    { key: "type", label: "Tipo" },
    { key: "severity", label: "Severidad", render: (value) => <Badge>{value}</Badge> },
    { key: "status", label: "Estado", render: (value) => <Badge>{value}</Badge> }
  ];

  return (
    <PageState loading={state.loading} error={state.error}>
      {state.data && <>
        <div className="page-intro">
          <div><h2>Visión general</h2><p>Estado actual de la operación y respuesta automatizada.</p></div>
          <button className="button button--primary" onClick={() => onNavigate("simulator")}><Icon name="simulator" size={18} /> Nueva simulación</button>
        </div>
        <section className="stats-grid">
          {statConfig.map(([key, label, icon, color]) => (
            <article className="stat-card" key={key}>
              <span className={`stat-card__icon stat-card__icon--${color}`}><Icon name={icon} /></span>
              <div><strong>{state.data.stats[key]}</strong><span>{label}</span></div>
              <small className="stat-card__status"><span /> Actualizado</small>
            </article>
          ))}
        </section>
        <section className="dashboard-grid">
          <article className="panel panel--wide">
            <div className="panel__header"><div><h3>Eventos recientes</h3><p>Últimas señales registradas por la plataforma</p></div><button className="link-button" onClick={() => onNavigate("events")}>Ver todos <Icon name="chevron" size={15} /></button></div>
            <DataTable columns={eventColumns} rows={state.data.recentEvents} />
          </article>
          <article className="panel severity-panel">
            <div className="panel__header"><div><h3>Distribución por severidad</h3><p>Incidentes clasificados</p></div></div>
            <div className="severity-chart">
              {Object.entries(state.data.severityDistribution).map(([severity, total]) => {
                const max = Math.max(1, ...Object.values(state.data.severityDistribution));
                return <div className="severity-row" key={severity}>
                  <div><Badge>{severity}</Badge><strong>{total}</strong></div>
                  <span className="severity-track"><i className={`severity-fill severity-fill--${severity.toLowerCase()}`} style={{ width: `${total ? Math.max(12, (total / max) * 100) : 0}%` }} /></span>
                </div>;
              })}
            </div>
          </article>
          <article className="panel panel--full">
            <div className="panel__header"><div><h3>Incidentes recientes</h3><p>Casos contenidos por los Playbooks</p></div><button className="link-button" onClick={() => onNavigate("incidents")}>Ver todos <Icon name="chevron" size={15} /></button></div>
            <DataTable columns={incidentColumns} rows={state.data.recentIncidents} />
          </article>
        </section>
      </>}
    </PageState>
  );
}

