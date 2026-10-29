import StatsCards from '../../components/dashboard/StatsCards';
import { useAuthStore } from '../../store/slices/authSlice';
import { useHasPermission } from '../../api/hooks/usePermission';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const canViewCases = useHasPermission('cases.view');
  const canManageUsers = useHasPermission('users.manage');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === 'SUPERADMIN' ? 'Platform Dashboard' : 'Operations Dashboard'}
        </h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.username}</p>
      </div>

      {/* CONDITIONAL RENDERING BASED ON PERMISSIONS */}
      
      {canViewCases ? (
        // Org Admin / Team Leader / Analyst View
        <>
          <StatsCards />

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/cases" className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center">
                <h3 className="font-medium text-gray-900">View Cases</h3>
                <p className="text-sm text-gray-500 mt-1">Manage and track all active cases</p>
              </Link>
            </div>
          </div>
        </>
      ) : (
        // Super Admin View
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Platform Management</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/users" className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center">
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500 mt-1">Create and manage organization admins</p>
            </Link>
            <Link to="/audits" className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center">
              <h3 className="font-medium text-gray-900">Audit Logs</h3>
              <p className="text-sm text-gray-500 mt-1">View platform activity logs</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}