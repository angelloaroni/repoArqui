import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import PageState from "../components/PageState.jsx";
import DataTable from "../components/DataTable.jsx";
import Badge from "../components/Badge.jsx";

const formatDate = (value) => value ? new Date(`${value.replace(" ", "T")}Z`).toLocaleString("es-PE") : "—";

export default function IncidentsPage({ refreshKey }) {
  const [state, setState] = useState({ rows: [], loading: true, error: "" });
  useEffect(() => {
    api.incidents().then((rows) => setState({ rows, loading: false, error: "" }))
      .catch((error) => setState({ rows: [], loading: false, error: error.message }));
  }, [refreshKey]);

  const columns = [
    { key: "id", label: "ID", render: (value) => `INC-${String(value).padStart(4, "0")}` },
    { key: "type", label: "Tipo", render: (value) => <strong>{value}</strong> },
    { key: "severity", label: "Severidad", render: (value) => <Badge>{value}</Badge> },
    { key: "status", label: "Estado", render: (value) => <Badge>{value}</Badge> },
    { key: "playbook_name", label: "Playbook" },
    { key: "created_at", label: "Fecha", render: formatDate }
  ];
  return (
    <PageState loading={state.loading} error={state.error}>
      <div className="page-intro"><div><h2>Gestión de incidentes</h2><p>Incidentes creados y contenidos automáticamente por la plataforma.</p></div><span className="record-count">{state.rows.length} incidentes</span></div>
      <section className="panel"><DataTable columns={columns} rows={state.rows} emptyMessage="No hay incidentes generados." /></section>
    </PageState>
  );
}

