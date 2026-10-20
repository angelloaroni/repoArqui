import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import PageState from "../components/PageState.jsx";
import DataTable from "../components/DataTable.jsx";
import { Icon } from "../components/Icons.jsx";

const formatDate = (value) => value ? new Date(`${value.replace(" ", "T")}Z`).toLocaleString("es-PE") : "—";

export default function BlockedPage({ refreshKey }) {
  const [state, setState] = useState({ users: [], ips: [], loading: true, error: "" });
  useEffect(() => {
    Promise.all([api.blockedUsers(), api.blockedIps()])
      .then(([users, ips]) => setState({ users, ips, loading: false, error: "" }))
      .catch((error) => setState({ users: [], ips: [], loading: false, error: error.message }));
  }, [refreshKey]);

  const userColumns = [
    { key: "username", label: "Usuario", render: (value) => <strong>{value}</strong> },
    { key: "reason", label: "Motivo" },
    { key: "created_at", label: "Fecha de bloqueo", render: formatDate }
  ];
  const ipColumns = [
    { key: "ip_address", label: "Dirección IP", render: (value) => <code>{value}</code> },
    { key: "reason", label: "Motivo" },
    { key: "created_at", label: "Fecha de bloqueo", render: formatDate }
  ];
  return (
    <PageState loading={state.loading} error={state.error}>
      <div className="page-intro"><div><h2>Entidades bloqueadas</h2><p>Usuarios y direcciones IP contenidos por los Playbooks.</p></div><span className="record-count">{state.users.length + state.ips.length} bloqueos</span></div>
      <div className="stacked-panels">
        <section className="panel"><div className="panel__header"><div className="section-title"><span><Icon name="blocked" /></span><div><h3>Usuarios bloqueados</h3><p>Identidades contenidas automáticamente</p></div></div></div><DataTable columns={userColumns} rows={state.users} emptyMessage="No hay usuarios bloqueados." /></section>
        <section className="panel"><div className="panel__header"><div className="section-title section-title--orange"><span><Icon name="events" /></span><div><h3>Direcciones IP bloqueadas</h3><p>Orígenes contenidos automáticamente</p></div></div></div><DataTable columns={ipColumns} rows={state.ips} emptyMessage="No hay direcciones IP bloqueadas." /></section>
      </div>
    </PageState>
  );
}

