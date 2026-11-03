import { useCases } from '../../api/hooks/useCases';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/slices/themeSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { Case } from '../../types/case';

export default function TeamLeaderDashboard() {
  // const { data: cases, isLoading } = useCases();
  const { data: paginatedData, isLoading } = useCases();
  const cases = paginatedData?.results || [];
  const { isDarkMode } = useThemeStore();
  const textColor = isDarkMode ? '#9ca3af' : '#4b5563';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';

  if (isLoading || !cases) return <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading dashboard...</div>;

  // Calculate Department Stats
  const pendingApprovals = cases.filter(c => c.status === 'PENDING_APPROVAL');
  const openCases = cases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
  const overdueCases = cases.filter(c => c.due_date && new Date(c.due_date) < new Date() && c.status !== 'CLOSED');
  const closedCases = cases.filter(c => c.status === 'CLOSED');

  // Calculate Team Workload (Group by assigned user)
  const teamWorkload = openCases.reduce((acc, caseItem) => {
    const assigneeName = typeof caseItem.assigned_to === 'object' && caseItem.assigned_to ? caseItem.assigned_to.username : 'Unassigned';
    const existing = acc.find(item => item.name === assigneeName);
    if (existing) {
      existing.cases += 1;
    } else {
      acc.push({ name: assigneeName, cases: 1 });
    }
    return acc;
  }, [] as { name: string, cases: number }[]);

  const kpiCards = [
    { label: 'Total Cases', value: cases.length, color: 'bg-gray-500', textColor: 'text-gray-600 dark:text-gray-400' },
    { label: 'Pending Approvals', value: pendingApprovals.length, color: 'bg-purple-500', textColor: 'text-purple-600 dark:text-purple-400' },
    { label: 'Team Open Cases', value: openCases.length, color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Overdue Cases', value: overdueCases.length, color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' },
    { label: 'Team Resolved', value: closedCases.length, color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
  ];

  const tooltipStyle = { backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', border: `1px solid ${gridColor}`, borderRadius: '0.5rem', color: isDarkMode ? '#f3f4f6' : '#111827' };
  // Calculate Priority Breakdown for Open Cases
  const priorityData = [
    { name: 'Critical', count: openCases.filter(c => c.priority === 'CRITICAL').length, fill: '#ef4444' },
    { name: 'High', count: openCases.filter(c => c.priority === 'HIGH').length, fill: '#f97316' },
    { name: 'Medium', count: openCases.filter(c => c.priority === 'MEDIUM').length, fill: '#eab308' },
    { name: 'Low', count: openCases.filter(c => c.priority === 'LOW').length, fill: '#6b7280' },
  ];
    // Get the last 5 cases (sorted by newest first)
  const recentCases = [...cases]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);
  // Group cases by Analyst
  const groupedByAnalyst = cases.reduce((acc, caseItem) => {
    const assigneeName = typeof caseItem.assigned_to === 'object' && caseItem.assigned_to ? caseItem.assigned_to.username : 'Unassigned';
    if (!acc[assigneeName]) acc[assigneeName] = [];
    acc[assigneeName].push(caseItem);
    return acc;
  }, {} as Record<string, Case[]>);

  return (
    <div className="space-y-6">
      {/* Smart Insights */}
      {pendingApprovals.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 flex items-center gap-3 transition-colors duration-200">
          <span className="text-2xl">🔔</span>
          <div>
            <p className="text-sm font-bold text-purple-800 dark:text-purple-300">Action Required</p>
            <p className="text-sm text-purple-700 dark:text-purple-400">You have {pendingApprovals.length} case(s) waiting for closure approval.</p>
          </div>
        </div>
      )}

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

        {/* 3. Recent Cases Table (Last 5) */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Team Cases</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last 5 updated cases in your department</p>
          </div>
          <Link to="/cases" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Analyst</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Case #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentCases.map(caseItem => {
                const analystName = typeof caseItem.assigned_to === 'object' && caseItem.assigned_to ? caseItem.assigned_to.username : 'Unassigned';
                return (
                  <tr key={caseItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          {analystName.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{analystName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-blue-600 dark:text-blue-400">
                      <Link to={`/cases/${caseItem.id}`}>{caseItem.case_number}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {caseItem.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        caseItem.priority === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        caseItem.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                        caseItem.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {caseItem.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        caseItem.status === 'OPEN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
                        caseItem.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                        caseItem.status === 'PENDING_APPROVAL' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {caseItem.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {caseItem.due_date ? new Date(caseItem.due_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

     {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Team Workload Chart */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 transition-colors duration-200">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Team Workload</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={teamWorkload}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="cases" name="Open Cases" radius={[4, 4, 0, 0]} barSize={32}>
                {teamWorkload.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cases > 3 ? '#ef4444' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">* Analysts with greater than 3 open cases are red.</p>
        </div>

        {/* Priority Breakdown Chart */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 transition-colors duration-200">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Department Priorities</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="count" name="Cases" radius={[4, 4, 0, 0]} barSize={32}>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
            {/* Pending & Overdue Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Pending Approvals Queue */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 transition-colors duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Pending Approvals</h3>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-full">{pendingApprovals.length}</span>
          </div>
          
          {pendingApprovals.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 py-6 text-center">No cases pending approval.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pendingApprovals.map(caseItem => (
                <Link 
                  to={`/cases/${caseItem.id}`} 
                  key={caseItem.id}
                  className="flex items-center justify-between p-2.5 border border-purple-100 dark:border-purple-900/40 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{caseItem.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{caseItem.case_number}</p>
                  </div>
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 ml-2 flex-shrink-0">Review →</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Cases */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 transition-colors duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Overdue Cases</h3>
            </div>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">{overdueCases.length}</span>
          </div>

          {overdueCases.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 py-6 text-center">No overdue cases. Great job!</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {overdueCases.slice(0, 5).map(caseItem => (
                <Link 
                  to={`/cases/${caseItem.id}`} 
                  key={caseItem.id}
                  className="flex items-center justify-between p-2.5 border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{caseItem.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Assigned to: {typeof caseItem.assigned_to === 'object' && caseItem.assigned_to ? caseItem.assigned_to.username : 'Unassigned'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400 ml-2 flex-shrink-0 whitespace-nowrap">
                    {new Date(caseItem.due_date!).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}