import StatsCards from '../../components/dashboard/StatsCards';
import AnalystDashboard from './AnalystDashboard';
import TeamLeaderDashboard from './TeamLeaderDashboard';
import { useAuthStore } from '../../store/slices/authSlice';
import { useHasPermission } from '../../api/hooks/usePermission';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const canViewCases = useHasPermission('cases.view');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {user?.role === 'SUPERADMIN' ? 'Platform Dashboard' : 'My Dashboard'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {user?.username}</p>
      </div>

      {/* Role-based Dashboards */}
      {user?.role === 'ANALYST' ? (
        <AnalystDashboard />
      ) : user?.role === 'TEAM_LEADER' ? (
        <TeamLeaderDashboard />
      ) : canViewCases ? (
        // Org Admin View
        <>
          <StatsCards />
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6 transition-colors duration-200">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/cases" className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">View Cases</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all active cases</p>
              </Link>
            </div>
          </div>
        </>
      ) : (
        // Super Admin View
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Platform Management</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/users" className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Manage Users</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage organization admins</p>
            </Link>
            <Link to="/audits" className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Audit Logs</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View platform activity logs</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}