import StatsCards from '../../components/dashboard/StatsCards';
import AnalystDashboard from './AnalystDashboard';
import TeamLeaderDashboard from './TeamLeaderDashboard';
import OrgAdminDashboard from './OrgAdminDashboard';
import { useAuthStore } from '../../store/slices/authSlice';
import { useHasPermission } from '../../api/hooks/usePermission';
import { Link } from 'react-router-dom';


import SuperAdminDashboard from './SuperAdminDashboard';
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {user?.role === 'SUPERADMIN' ? 'Platform Dashboard' : 'My Dashboard'}
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            🖨️ Print
          </button>
          <button onClick={() => { if (navigator.share) { navigator.share({ title: 'My Dashboard', url: window.location.href }).catch(() => {}); } else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); } }} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            🔗 Share
          </button>
        </div>
      </div>

      {/* Role-based Dashboards */}
      {user?.role === 'SUPERADMIN' ? (
        <SuperAdminDashboard />
      ) : user?.role === 'ORG_ADMIN' ? (
        <OrgAdminDashboard />
      ) : user?.role === 'TEAM_LEADER' ? (
        <TeamLeaderDashboard />
      ) : user?.role === 'ANALYST' ? (
        <AnalystDashboard />
      ) : null}
    </div>
  );
}