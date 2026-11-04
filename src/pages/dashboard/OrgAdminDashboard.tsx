import { useCases } from '../../api/hooks/useCases';
import { useUsers } from '../../api/hooks/useUsers';
import { useDepartments } from '../../api/hooks/useDepartments';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/slices/themeSlice';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function OrgAdminDashboard() {
  const { data: paginatedData, isLoading } = useCases();
  const cases = paginatedData?.results || [];
  const { data: users } = useUsers();
  const { data: departments } = useDepartments();
  const { isDarkMode } = useThemeStore();

  const textColor = isDarkMode ? '#9ca3af' : '#4b5563';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipStyle = { backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', border: `1px solid ${gridColor}`, borderRadius: '0.5rem', color: isDarkMode ? '#f3f4f6' : '#111827' };

  if (isLoading) return <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading dashboard...</div>;

  // Calculate Org-wide Stats
  const totalCases = cases.length;
  const openCases = cases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
  const pendingApprovals = cases.filter(c => c.status === 'PENDING_APPROVAL');
  const overdueCases = cases.filter(c => c.due_date && new Date(c.due_date) < new Date() && c.status !== 'CLOSED');
  const closedCases = cases.filter(c => c.status === 'CLOSED');

  // Department Performance
  const deptPerformance = departments?.map(dept => {
    const deptCases = cases.filter(c => {
      const caseDeptId = typeof c.department === 'object' && c.department ? c.department.id : c.department;
      return caseDeptId === dept.id;
    });
    return {
      name: dept.name,
      total: deptCases.length,
      open: deptCases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length,
      closed: deptCases.filter(c => c.status === 'CLOSED').length,
      overdue: deptCases.filter(c => c.due_date && new Date(c.due_date) < new Date() && c.status !== 'CLOSED').length,
    };
  }) || [];

  // Chart Data: Cases by Department
  const casesByDept = deptPerformance.map(d => ({ name: d.name, cases: d.total }));

  // Chart Data: Status Distribution
  const statusData = [
    { name: 'Open', value: openCases.length, color: '#3b82f6' },
    { name: 'In Progress', value: cases.filter(c => c.status === 'IN_PROGRESS').length, color: '#f59e0b' },
    { name: 'Pending', value: pendingApprovals.length, color: '#8b5cf6' },
    { name: 'Closed', value: closedCases.length, color: '#10b981' },
  ].filter(item => item.value > 0);

  // Chart Data: Users by Role
  const usersByRole = [
    { name: 'Org Admin', value: users?.filter(u => u.role === 'ORG_ADMIN').length || 0, color: '#8b5cf6' },
    { name: 'Team Leader', value: users?.filter(u => u.role === 'TEAM_LEADER').length || 0, color: '#3b82f6' },
    { name: 'Analyst', value: users?.filter(u => u.role === 'ANALYST').length || 0, color: '#10b981' },
  ].filter(item => item.value > 0);

  // Smart Insights
  const insights = [];
  if (overdueCases.length > 0) {
    insights.push({ type: 'warning', message: `There are ${overdueCases.length} overdue cases across the organization.` });
  }
  if (pendingApprovals.length > 0) {
    insights.push({ type: 'info', message: `${pendingApprovals.length} cases are pending approval. Assign Team Leaders to review them.` });
  }
  if (overdueCases.length === 0 && pendingApprovals.length === 0) {
    insights.push({ type: 'success', message: 'Your organization is running smoothly. No overdue or pending cases.' });
  }

  const kpiCards = [
    { label: 'Total Cases', value: totalCases, color: 'bg-gray-500', textColor: 'text-gray-600 dark:text-gray-400' },
    { label: 'Open Cases', value: openCases.length, color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Pending Approval', value: pendingApprovals.length, color: 'bg-purple-500', textColor: 'text-purple-600 dark:text-purple-400' },
    { label: 'Overdue', value: overdueCases.length, color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' },
    { label: 'Total Users', value: users?.length || 0, color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Smart Insights */}
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg flex items-center gap-3 transition-colors duration-200 ${
            insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
            insight.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
            'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300'
          }`}>
            <span className="text-xl">{insight.type === 'warning' ? '⚠️' : insight.type === 'info' ? 'ℹ️' : '✅'}</span>
            <p className="text-sm font-medium">{insight.message}</p>
          </div>
        ))}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cases by Department */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 transition-colors duration-200">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Cases by Department</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={casesByDept}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="cases" name="Cases" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 transition-colors duration-200">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fill: textColor, fontSize: 12 }}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: textColor }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Performance Table & User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Department Performance */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 lg:col-span-2 transition-colors duration-200">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Department Performance</h3>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Department</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Open</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Overdue</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Closed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {deptPerformance.map(dept => (
                <tr key={dept.name} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">{dept.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{dept.total}</td>
                  <td className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 font-medium">{dept.open}</td>
                  <td className="px-4 py-2 text-sm text-red-600 dark:text-red-400 font-medium">{dept.overdue}</td>
                  <td className="px-4 py-2 text-sm text-green-600 dark:text-green-400 font-medium">{dept.closed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Users by Role */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 transition-colors duration-200">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Team Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={usersByRole} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} label={{ fill: textColor, fontSize: 11 }}>
                {usersByRole.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: textColor, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <Link to="/users" className="block text-center text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2">Manage Users →</Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/cases" className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
          <p className="text-2xl mb-1">📁</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">View Cases</p>
        </Link>
        <Link to="/users" className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
          <p className="text-2xl mb-1">👥</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Manage Users</p>
        </Link>
        <Link to="/reports" className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
          <p className="text-2xl mb-1">📊</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Reports</p>
        </Link>
        <Link to="/audits" className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
          <p className="text-2xl mb-1">📜</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Audit Logs</p>
        </Link>
      </div>
    </div>
  );
}