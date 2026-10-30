import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/slices/authSlice';
import { WebSocketProvider } from './context/WebSocketContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CasesPage from './pages/dashboard/CasesPage';
import UsersPage from './pages/dashboard/UsersPage';
import ReportsPage from './pages/dashboard/ReportsPage'; 
import CaseDetailPage from './pages/dashboard/CaseDetailPage';
import { useHasPermission } from './api/hooks/usePermission';
import AuditLogsPage from './pages/dashboard/AuditLogsPage';
import OrganizationsPage from './pages/admin/OrganizationsPage';



const queryClient = new QueryClient();



// ... existing imports ...

const ProtectedRoute = ({ children, requiredPermission }: { children: React.ReactNode, requiredPermission?: string }) => {
  const user = useAuthStore((state) => state.user);
  const hasPermission = useHasPermission(requiredPermission || '');
  
  if (!user) return <Navigate to="/login" replace />;
  if (requiredPermission && !hasPermission) return <Navigate to="/dashboard" replace />; 
  
  return <AppLayout>{children}</AppLayout>;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <WebSocketProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/cases" element={<ProtectedRoute requiredPermission="cases.view"><CasesPage /></ProtectedRoute>} />
            <Route path="/cases/:id" element={<ProtectedRoute requiredPermission="cases.view"><CaseDetailPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute requiredPermission="users.manage"><UsersPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute requiredPermission="reports.view"><ReportsPage /></ProtectedRoute>} />
            {/* Add this line! */}
            <Route path="/audits" element={<ProtectedRoute requiredPermission="audits.view"><AuditLogsPage /></ProtectedRoute>} />
            <Route path="/organizations" element={<ProtectedRoute requiredPermission="organizations.manage"><OrganizationsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </WebSocketProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}