import { useCases } from '../../api/hooks/useCases';
import { useAuthStore } from '../../store/slices/authSlice';
import { useThemeStore } from '../../store/slices/themeSlice';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const { data: paginatedData, isLoading } = useCases({ page: 1, ordering: '-created_at' });
  const cases = paginatedData?.results || [];

  if (isLoading) return <div className="animate-pulse text-gray-500 dark:text-gray-400">Generating report...</div>;

  const total = cases.length || 0;
  const openCases = cases.filter(c => c.status === 'OPEN').length || 0;
  const inProgressCases = cases.filter(c => c.status === 'IN_PROGRESS').length || 0;
  const pendingCases = cases.filter(c => c.status === 'PENDING_APPROVAL').length || 0;
  const closedCases = cases.filter(c => c.status === 'CLOSED').length || 0;

  const getPercentage = (count: number) => total > 0 ? ((count / total) * 100).toFixed(1) : 0;

  const handleExport = () => {
    const headers = ['Case Number', 'Title', 'Status', 'Priority', 'Due Date', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...cases.map(c => [
        c.case_number,
        `"${c.title}"`,
        c.status,
        c.priority,
        c.due_date || 'N/A',
        new Date(c.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const statusRows = [
    { label: 'Open', count: openCases, color: 'bg-blue-600' },
    { label: 'In Progress', count: inProgressCases, color: 'bg-yellow-500' },
    { label: 'Pending Approval', count: pendingCases, color: 'bg-purple-600' },
    { label: 'Closed', count: closedCases, color: 'bg-green-600' },
  ];

    // Chart Data
  const statusChartData = [
    { name: 'Open', value: openCases, color: '#3b82f6' },
    { name: 'In Progress', value: inProgressCases, color: '#f59e0b' },
    { name: 'Pending', value: pendingCases, color: '#8b5cf6' },
    { name: 'Closed', value: closedCases, color: '#10b981' },
  ].filter(item => item.value > 0);

  const priorityChartData = [
    { name: 'Critical', count: cases.filter(c => c.priority === 'CRITICAL').length, fill: '#ef4444' },
    { name: 'High', count: cases.filter(c => c.priority === 'HIGH').length, fill: '#f97316' },
    { name: 'Medium', count: cases.filter(c => c.priority === 'MEDIUM').length, fill: '#eab308' },
    { name: 'Low', count: cases.filter(c => c.priority === 'LOW').length, fill: '#6b7280' },
  ];

  // Team Leader: Cases by Analyst
  const casesByAnalyst = cases.reduce((acc, caseItem) => {
    const assigneeName = typeof caseItem.assigned_to === 'object' && caseItem.assigned_to ? caseItem.assigned_to.username : 'Unassigned';
    const existing = acc.find(item => item.name === assigneeName);
    if (existing) {
      existing.cases += 1;
    } else {
      acc.push({ name: assigneeName, cases: 1 });
    }
    return acc;
  }, [] as { name: string, cases: number }[]);

  const { isDarkMode } = useThemeStore();
  const textColor = isDarkMode ? '#9ca3af' : '#4b5563';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipStyle = { backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', border: `1px solid ${gridColor}`, borderRadius: '0.5rem', color: isDarkMode ? '#f3f4f6' : '#111827' };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {user?.role === 'ANALYST' ? 'My Case Reports' : 'Case Reports'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Detailed breakdown and exportable statistics
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
            📥 Export CSV
          </button>
          <button onClick={() => window.print()} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors">
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Detailed Cases Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Cases Detail</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Case #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {cases.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-blue-600 dark:text-blue-400">{c.case_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{c.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      c.status === 'OPEN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
                      c.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                      c.status === 'PENDING_APPROVAL' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    }`}>{c.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{c.priority}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{c.due_date ? new Date(c.due_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Breakdown Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Status Breakdown</h2>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Percentage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Visual</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {statusRows.map(row => (
              <tr key={row.label} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{row.label}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{row.count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{getPercentage(row.count)}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm w-1/4">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className={`${row.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${getPercentage(row.count)}%` }}></div>
                  </div>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 dark:bg-gray-900 font-bold">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Total</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{total}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">100%</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Priority Breakdown</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Critical', count: cases.filter(c => c.priority === 'CRITICAL').length, color: 'bg-red-500' },
            { label: 'High', count: cases.filter(c => c.priority === 'HIGH').length, color: 'bg-orange-500' },
            { label: 'Medium', count: cases.filter(c => c.priority === 'MEDIUM').length, color: 'bg-yellow-500' },
            { label: 'Low', count: cases.filter(c => c.priority === 'LOW').length, color: 'bg-gray-500' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className={`mx-auto h-12 w-12 ${item.color} rounded-full flex items-center justify-center text-white font-bold mb-2`}>
                {item.count}
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

            {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} label={{ fill: textColor, fontSize: 12 }}>
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: textColor }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Breakdown Bar Chart */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Priority Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: textColor }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="count" name="Cases" radius={[4, 4, 0, 0]} barSize={40}>
                {priorityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Leader: Cases by Analyst Chart */}
      {(user?.role === 'TEAM_LEADER' || user?.role === 'ORG_ADMIN') && casesByAnalyst.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Cases by Analyst</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={casesByAnalyst}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: textColor }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="cases" name="Cases" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                {casesByAnalyst.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cases > 3 ? '#ef4444' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">* Analysts with greater than 3 cases are highlighted in red.</p>
        </div>
      )}
    </div>
  );
}