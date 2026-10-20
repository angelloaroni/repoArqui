import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EventBusPage from './pages/EventBusPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PublishPage from './pages/PublishPage.jsx';
import ScenariosPage from './pages/ScenariosPage.jsx';
import SubscribersPage from './pages/SubscribersPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="publicar" element={<PublishPage />} />
        <Route path="bus" element={<EventBusPage />} />
        <Route path="suscriptores" element={<SubscribersPage />} />
        <Route path="historial" element={<HistoryPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="escenarios" element={<ScenariosPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

