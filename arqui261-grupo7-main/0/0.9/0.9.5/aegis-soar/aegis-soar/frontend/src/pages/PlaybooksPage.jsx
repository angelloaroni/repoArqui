import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import PageState from "../components/PageState.jsx";
import { Icon } from "../components/Icons.jsx";

export default function PlaybooksPage({ refreshKey, onDataChanged }) {
  const [state, setState] = useState({ rows: [], loading: true, error: "", toggling: null });

  function load() {
    api.playbooks()
      .then((rows) => setState((current) => ({ ...current, rows, loading: false, error: "" })))
      .catch((error) => setState((current) => ({ ...current, loading: false, error: error.message })));
  }
  useEffect(load, [refreshKey]);

  async function toggle(id) {
    setState((current) => ({ ...current, toggling: id }));
    try {
      await api.togglePlaybook(id);
      onDataChanged();
      load();
    } catch (error) {
      setState((current) => ({ ...current, error: error.message, toggling: null }));
    }
  }

  return (
    <PageState loading={state.loading} error={state.error}>
      <div className="page-intro"><div><h2>Playbooks de respuesta</h2><p>Configura las automatizaciones que responden ante eventos detectados.</p></div><span className="simulation-safe"><span className="live-dot" /> {state.rows.filter((row) => row.active).length} activos</span></div>
      <section className="playbook-grid">
        {state.rows.map((playbook) => (
          <article className={`playbook-card ${!playbook.active ? "playbook-card--inactive" : ""}`} key={playbook.id}>
            <div className="playbook-card__header">
              <span className="playbook-card__icon"><Icon name="playbooks" size={25} /></span>
              <label className="switch">
                <input type="checkbox" checked={playbook.active} disabled={state.toggling === playbook.id} onChange={() => toggle(playbook.id)} />
                <span className="switch__track"><span /></span>
              </label>
            </div>
            <div className="playbook-card__status"><span className={`status-dot ${playbook.active ? "" : "status-dot--off"}`} /> {playbook.active ? "ACTIVO" : "DESACTIVADO"}</div>
            <h3>{playbook.name}</h3>
            <p className="playbook-event">Al detectar <code>{playbook.event_type}</code></p>
            <div className="playbook-meta"><span>Severidad</span><strong className={`text-${playbook.severity.toLowerCase()}`}>{playbook.severity}</strong></div>
            <div className="action-list"><small>ACCIONES AUTOMATIZADAS</small>{playbook.actions.map((action, index) => <div key={action}><span>{index + 1}</span>{action}</div>)}</div>
          </article>
        ))}
      </section>
    </PageState>
  );
}

