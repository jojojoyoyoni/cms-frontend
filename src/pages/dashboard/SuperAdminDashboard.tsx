import { useOrganizations } from '../../api/hooks/useOrganizations';
import { useUsers } from '../../api/hooks/useUsers';
import { useAuditLogs } from '../../api/hooks/useAudits';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/slices/themeSlice';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function SuperAdminDashboard() {
  const { data: orgs, isLoading: orgsLoading } = useOrganizations();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: logs, isLoading: logsLoading } = useAuditLogs();
  const { isDarkMode } = useThemeStore();

  const textColor = isDarkMode ? '#9ca3af' : '#4b5563';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipStyle = { backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', border: `1px solid ${gridColor}`, borderRadius: '0.5rem', color: isDarkMode ? '#f3f4f6' : '#111827' };

  if (orgsLoading || usersLoading) return <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading platform data...</div>;

  // Platform Stats
  const totalOrgs = orgs?.length || 0;
  const activeOrgs = orgs?.filter(o => o.is_active).length || 0;
  const suspendedOrgs = totalOrgs - activeOrgs;
  const totalUsers = users?.length || 0;
  const totalCases = orgs?.reduce((sum, o) => sum + (o.case_count || 0), 0) || 0;

  // Chart Data: Users by Org
  const usersByOrg = orgs?.map(o => ({ name: o.name, users: o.user_count })) || [];

  // Chart Data: Org Status
  const orgStatusData = [
    { name: 'Active', value: activeOrgs, color: '#10b981' },
    { name: 'Suspended', value: suspendedOrgs, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Chart Data: Users by Role
  const usersByRole = [
    { name: 'Super Admin', value: users?.filter(u => u.role === 'SUPERADMIN').length || 0, color: '#ef4444' },
    { name: 'Org Admin', value: users?.filter(u => u.role === 'ORG_ADMIN').length || 0, color: '#8b5cf6' },
    { name: 'Team Leader', value: users?.filter(u => u.role === 'TEAM_LEADER').length || 0, color: '#3b82f6' },
    { name: 'Analyst', value: users?.filter(u => u.role === 'ANALYST').length || 0, color: '#10b981' },
  ].filter(item => item.value > 0);

  const kpiCards = [
    { label: 'Organizations', value: totalOrgs, color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Users', value: totalUsers, color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
    { label: 'Total Cases', value: totalCases, color: 'bg-purple-500', textColor: 'text-purple-600 dark:text-purple-400' },
    { label: 'Active Orgs', value: activeOrgs, color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Suspended', value: suspendedOrgs, color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Smart Insights */}
      <div className="space-y-2">
        {suspendedOrgs > 0 && (
          <div className="p-4 rounded-lg flex items-center gap-3 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 transition-colors duration-200">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-medium">{suspendedOrgs} organization(s) are currently suspended.</p>
          </div>
        )}
        {totalOrgs > 0 && suspendedOrgs === 0 && (
          <div className="p-4 rounded-lg flex items-center gap-3 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 transition-colors duration-200">
            <span className="text-xl">✅</span>
            <p className="text-sm font-medium">All {totalOrgs} organizations are active and running smoothly.</p>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpiCards.map(card => (
          <div key={card.label} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-4 transition-colors duration-200">
            <div className="flex items-center">
              <div className={`flex-shrink-0 h-8 w-8 rounded-full ${card.color} flex items-center justify-center text-white font-bold text-sm`}>
                {card.value}
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{card.label}</dt>
                  <dd className={`text-xl font-bold ${card.textColor}`}>{card.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Users by Organization */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 transition-colors duration-200">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Users by Organization</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={usersByOrg}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="users" name="Users" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Organization Status */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 transition-colors duration-200">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Organization Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={orgStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} label={{ fill: textColor, fontSize: 12 }}>
                {orgStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: textColor }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Users by Role */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 transition-colors duration-200">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Platform User Distribution by Role</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={usersByRole} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fill: textColor, fontSize: 12 }}>
              {usersByRole.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: textColor }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Organizations & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Organizations */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 transition-colors duration-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Recent Organizations</h3>
            <Link to="/organizations" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {orgs?.slice(0, 5).map(org => (
              <Link to="/organizations" key={org.id} className="flex items-center justify-between p-2 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-2">
                  {org.logo_url ? (
                    <img src={org.logo_url} alt={org.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {org.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{org.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{org.user_count} users · {org.case_count} cases</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${org.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                  {org.is_active ? 'Active' : 'Suspended'}
                </span>
              </Link>
            ))}
            {orgs?.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No organizations yet.</p>}
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 transition-colors duration-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Recent Platform Activity</h3>
            <Link to="/audits" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs?.slice(0, 5).map(log => (
              <div key={log.id} className="border-l-2 border-blue-500 pl-3 py-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {log.action} by {String(log.user)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
            {logs?.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No recent activity.</p>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Link to="/organizations" className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
          <p className="text-2xl mb-1">🏛️</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Manage Organizations</p>
        </Link>
        <Link to="/users" className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
          <p className="text-2xl mb-1">👥</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Manage Users</p>
        </Link>
        <Link to="/audits" className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
          <p className="text-2xl mb-1">📜</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Audit Logs</p>
        </Link>
      </div>
    </div>
  );
}