import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import PageState from "../components/PageState.jsx";
import DataTable from "../components/DataTable.jsx";
import Badge from "../components/Badge.jsx";

const formatDate = (value) => value ? new Date(`${value.replace(" ", "T")}Z`).toLocaleString("es-PE") : "—";

export default function HistoryPage({ refreshKey }) {
  const [state, setState] = useState({ rows: [], loading: true, error: "" });
  useEffect(() => {
    api.actions().then((rows) => setState({ rows, loading: false, error: "" }))
      .catch((error) => setState({ rows: [], loading: false, error: error.message }));
  }, [refreshKey]);
  const columns = [
    { key: "id", label: "ID", render: (value) => `ACT-${String(value).padStart(4, "0")}` },
    { key: "action_type", label: "Acción", render: (value) => <strong className="mono-accent">{value}</strong> },
    { key: "incident_id", label: "Incidente", render: (value) => value ? `INC-${String(value).padStart(4, "0")}` : "—" },
    { key: "description", label: "Descripción" },
    { key: "result", label: "Resultado", render: (value) => <Badge variant={value === "Completada" ? "contained" : "disabled"}>{value}</Badge> },
    { key: "created_at", label: "Fecha", render: formatDate }
  ];
  return (
    <PageState loading={state.loading} error={state.error}>
      <div className="page-intro"><div><h2>Historial de acciones</h2><p>Auditoría de cada respuesta ejecutada u omitida por AegisSOAR.</p></div><span className="record-count">{state.rows.length} acciones</span></div>
      <section className="panel"><DataTable columns={columns} rows={state.rows} emptyMessage="Todavía no se han ejecutado acciones." /></section>
    </PageState>
  );
}

