import { Icon } from "./Icons.jsx";

const navigation = [
  ["dashboard", "Dashboard"],
  ["simulator", "Simulador"],
  ["events", "Eventos"],
  ["incidents", "Incidentes"],
  ["playbooks", "Playbooks"],
  ["blocked", "Bloqueados"],
  ["history", "Historial"]
];

export default function Layout({ page, onNavigate, onLogout, children }) {
  const currentLabel = navigation.find(([key]) => key === page)?.[1] || "Dashboard";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark"><Icon name="shield" size={25} /></span>
          <span><strong>AegisSOAR</strong><small>Security Automation Platform</small></span>
        </div>
        <nav className="nav">
          <p className="nav__label">OPERACIONES</p>
          {navigation.map(([key, label]) => (
            <button
              key={key}
              className={`nav__item ${page === key ? "nav__item--active" : ""}`}
              onClick={() => onNavigate(key)}
            >
              <Icon name={key} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__status">
          <span className="live-dot" />
          <div><strong>Sistema operativo</strong><small>Monitoreo activo</small></div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">CENTRO DE OPERACIONES DE SEGURIDAD</p>
            <h1>{currentLabel}</h1>
          </div>
          <div className="topbar__actions">
            <div className="analyst"><span>AD</span><div><strong>Administrador</strong><small>Analista SOC</small></div></div>
            <button className="icon-button" onClick={onLogout} title="Cerrar sesión" aria-label="Cerrar sesión">
              <Icon name="logout" />
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

