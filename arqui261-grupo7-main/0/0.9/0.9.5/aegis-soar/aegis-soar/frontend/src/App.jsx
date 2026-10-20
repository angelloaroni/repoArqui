import { useState } from "react";
import Layout from "./components/Layout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SimulatorPage from "./pages/SimulatorPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import IncidentsPage from "./pages/IncidentsPage.jsx";
import PlaybooksPage from "./pages/PlaybooksPage.jsx";
import BlockedPage from "./pages/BlockedPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";

const pages = {
  dashboard: DashboardPage,
  simulator: SimulatorPage,
  events: EventsPage,
  incidents: IncidentsPage,
  playbooks: PlaybooksPage,
  blocked: BlockedPage,
  history: HistoryPage
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem("aegis-auth") === "true"
  );
  const [page, setPage] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const CurrentPage = pages[page];

  function login() {
    localStorage.setItem("aegis-auth", "true");
    setAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem("aegis-auth");
    setAuthenticated(false);
    setPage("dashboard");
  }

  if (!authenticated) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <Layout page={page} onNavigate={setPage} onLogout={logout}>
      <CurrentPage
        refreshKey={refreshKey}
        onDataChanged={() => setRefreshKey((value) => value + 1)}
        onNavigate={setPage}
      />
    </Layout>
  );
}

