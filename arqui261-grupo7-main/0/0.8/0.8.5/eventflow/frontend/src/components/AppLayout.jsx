import { NavLink, Outlet } from 'react-router-dom';
import DemoControls from './DemoControls.jsx';

const navigation = [
  { to: '/', label: 'Inicio', icon: '⌂' },
  { to: '/publicar', label: 'Publicar evento', icon: '＋' },
  { to: '/bus', label: 'Bus de Eventos', icon: '⇢' },
  { to: '/suscriptores', label: 'Suscriptores', icon: '◎' },
  { to: '/historial', label: 'Historial', icon: '≡' },
  { to: '/dashboard', label: 'Dashboard', icon: '▥' },
  { to: '/escenarios', label: 'Escenarios de demostración', icon: '◇' },
];

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            EF
          </span>
          <div>
            <strong>EventFlow</strong>
          </div>
        </div>

        <nav className="main-navigation" aria-label="Navegación principal">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <DemoControls />
      </aside>

      <div className="app-content">
        <header className="topbar">
          <div>
            <strong>EventFlow</strong>
            <span>Simulador del patrón Publicador-Suscriptor</span>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
