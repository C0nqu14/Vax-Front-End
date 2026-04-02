import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExplorePage } from './pages/ExplorePage';
import { CreateCampaignPage } from './pages/CreateCampaignPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { BankDetailsPage } from './pages/BankDetailsPage';
import { AdminUserManagementPage } from './pages/AdminUserManagementPage';
import { AdminCampaignsPage } from './pages/AdminCampaignsPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminDonationsPage } from './pages/AdminDonationsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyCampaignsPage } from './pages/MyCampaignsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AppLayout } from './components/AppLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rotas Protegidas com Layout Consistente */}
          <Route element={<AppLayout />}>
            <Route path="/explorar" element={<ExplorePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/campanhas/nova" element={<CreateCampaignPage />} />
            <Route path="/campanhas/:id" element={<CampaignDetailPage />} />
            <Route path="/banco" element={<BankDetailsPage />} />
            <Route path="/meus-projetos" element={<MyCampaignsPage />} />
            <Route path="/historico" element={<HistoryPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/perfil/:id" element={<UserProfilePage />} />
            <Route path="/admin/usuarios" element={<AdminUserManagementPage />} />
            <Route path="/admin/campanhas" element={<AdminCampaignsPage />} />
            <Route path="/admin/relatorios" element={<AdminReportsPage />} />
            <Route path="/admin/doacoes" element={<AdminDonationsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

