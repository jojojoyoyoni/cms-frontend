import { useCases } from '../../api/hooks/useCases';
import { Link } from 'react-router-dom';
import type { Case } from '../../types/case';
import { useThemeStore } from '../../store/slices/themeSlice';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AnalystDashboard() {
  const { data: cases, isLoading } = useCases();
  const { isDarkMode } = useThemeStore();
  const textColor = isDarkMode ? '#9ca3af' : '#4b5563';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';

  if (isLoading || !cases) return <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading your dashboard...</div>;

  // Calculate Stats
  const myOpenCases = cases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
  const myPendingApprovals = cases.filter(c => c.status === 'PENDING_APPROVAL');
  const myOverdueCases = cases.filter(c => c.due_date && new Date(c.due_date) < new Date() && c.status !== 'CLOSED');
  const myClosedCases = cases.filter(c => c.status === 'CLOSED');

  // Chart Data: Status Distribution
  const statusData = [
    { name: 'Open', value: cases.filter(c => c.status === 'OPEN').length, color: '#3b82f6' },
    { name: 'In Progress', value: cases.filter(c => c.status === 'IN_PROGRESS').length, color: '#f59e0b' },
    { name: 'Pending', value: myPendingApprovals.length, color: '#8b5cf6' },
    { name: 'Closed', value: myClosedCases.length, color: '#10b981' },
  ].filter(item => item.value > 0);

  // Chart Data: Priority Breakdown
  const priorityData = [
    { name: 'Critical', count: cases.filter(c => c.priority === 'CRITICAL' && c.status !== 'CLOSED').length, fill: '#ef4444' },
    { name: 'High', count: cases.filter(c => c.priority === 'HIGH' && c.status !== 'CLOSED').length, fill: '#f97316' },
    { name: 'Medium', count: cases.filter(c => c.priority === 'MEDIUM' && c.status !== 'CLOSED').length, fill: '#eab308' },
    { name: 'Low', count: cases.filter(c => c.priority === 'LOW' && c.status !== 'CLOSED').length, fill: '#6b7280' },
  ];

  // Upcoming Deadlines
  const upcomingDeadlines = myOpenCases
    .filter(c => c.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  // Smart Insights Logic
  const insights = [];
  if (myOverdueCases.length > 0) {
    insights.push({ type: 'warning', message: `You have ${myOverdueCases.length} overdue case(s). Address them immediately!` });
  }
  if (myPendingApprovals.length > 0) {
    insights.push({ type: 'info', message: `${myPendingApprovals.length} case(s) are waiting for Team Leader approval.` });
  }
  if (myOverdueCases.length === 0 && myPendingApprovals.length === 0) {
    insights.push({ type: 'success', message: 'Great job! You have no overdue or pending cases.' });
  }
  if (priorityData[0].count > 0) {
    insights.push({ type: 'danger', message: `You have ${priorityData[0].count} Critical priority case(s) open.` });
  }

  const kpiCards = [
    { label: 'My Open Cases', value: myOpenCases.length, color: 'bg-blue-500' },
    { label: 'Pending Approval', value: myPendingApprovals.length, color: 'bg-purple-500' },
    { label: 'Overdue', value: myOverdueCases.length, color: 'bg-red-500' },
    { label: 'Resolved', value: myClosedCases.length, color: 'bg-green-500' },
  ];

  const tooltipStyle = { backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', border: `1px solid ${gridColor}`, borderRadius: '0.5rem', color: isDarkMode ? '#f3f4f6' : '#111827' };

  return (
    <div className="space-y-6">
      {/* Smart Insights Banner */}
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg flex items-center gap-3 transition-colors duration-200 ${
            insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
            insight.type === 'danger' ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
            insight.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
            'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300'
          }`}>
            <span className="text-xl">{insight.type === 'warning' ? '⚠️' : insight.type === 'danger' ? '🚨' : insight.type === 'info' ? 'ℹ️' : '✅'}</span>
            <p className="text-sm font-medium">{insight.message}</p>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(card => (
          <div key={card.label} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5 transition-colors duration-200">
            <div className="flex items-center">
              <div className={`flex-shrink-0 h-10 w-10 rounded-full ${card.color} flex items-center justify-center text-white font-bold`}>
                {card.value}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{card.label}</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">My Case Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
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

        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">My Open Priorities</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} />
              <YAxis tick={{ fontSize: 12, fill: textColor }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Deadlines & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 lg:col-span-2 transition-colors duration-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">My Upcoming Deadlines</h2>
            <Link to="/cases" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
          </div>
          
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No upcoming deadlines. Great job!</p>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map(caseItem => {
                const isOverdue = new Date(caseItem.due_date!) < new Date();
                return (
                  <Link to={`/cases/${caseItem.id}`} key={caseItem.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{caseItem.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{caseItem.case_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {new Date(caseItem.due_date!).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">{caseItem.priority}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/cases" className="block w-full bg-blue-600 text-white text-center px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              View My Cases
            </Link>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Recent Activity</h3>
              {myClosedCases.slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center gap-2 py-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Closed: {c.title}</p>
                </div>
              ))}
              {myClosedCases.length === 0 && <p className="text-xs text-gray-400">No recent activity.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}