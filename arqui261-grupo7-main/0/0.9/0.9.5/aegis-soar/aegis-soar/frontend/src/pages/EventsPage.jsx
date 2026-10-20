import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import PageState from "../components/PageState.jsx";
import DataTable from "../components/DataTable.jsx";
import Badge from "../components/Badge.jsx";

const formatDate = (value) => value ? new Date(`${value.replace(" ", "T")}Z`).toLocaleString("es-PE") : "—";

export default function EventsPage({ refreshKey }) {
  const [state, setState] = useState({ rows: [], loading: true, error: "" });

  useEffect(() => {
    api.events()
      .then((rows) => setState({ rows, loading: false, error: "" }))
      .catch((error) => setState({ rows: [], loading: false, error: error.message }));
  }, [refreshKey]);

  const columns = [
    { key: "id", label: "ID", render: (value) => `EVT-${String(value).padStart(4, "0")}` },
    { key: "type", label: "Tipo", render: (value) => <strong className="mono-accent">{value}</strong> },
    { key: "username", label: "Usuario" },
    { key: "ip_address", label: "Dirección IP", render: (value) => <code>{value}</code> },
    { key: "created_at", label: "Fecha", render: formatDate },
    { key: "result", label: "Resultado", render: (value) => <Badge variant={value === "Incidente generado" ? "generated" : value === "Playbook deshabilitado" ? "disabled" : "registered"}>{value}</Badge> }
  ];

  return (
    <PageState loading={state.loading} error={state.error}>
      <div className="page-intro"><div><h2>Registro de eventos</h2><p>Trazabilidad completa de señales recibidas y su resultado.</p></div><span className="record-count">{state.rows.length} registros</span></div>
      <section className="panel"><DataTable columns={columns} rows={state.rows} emptyMessage="No hay eventos. Ejecuta una simulación para comenzar." /></section>
    </PageState>
  );
}

