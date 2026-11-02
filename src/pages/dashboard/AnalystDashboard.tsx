import { useCases } from '../../api/hooks/useCases';
import { Link } from 'react-router-dom';
import type { Case } from '../../types/case';

export default function AnalystDashboard() {
  const { data: cases, isLoading } = useCases();

  if (isLoading || !cases) return <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading your dashboard...</div>;

  // Calculate Analyst specific stats
  const myOpenCases = cases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
  const myPendingApprovals = cases.filter(c => c.status === 'PENDING_APPROVAL');
  const myOverdueCases = cases.filter(c => 
    c.due_date && new Date(c.due_date) < new Date() && c.status !== 'CLOSED'
  );
  const myClosedCases = cases.filter(c => c.status === 'CLOSED');

  // Get upcoming deadlines (Open cases with due dates, sorted by soonest)
  const upcomingDeadlines = myOpenCases
    .filter(c => c.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  const kpiCards = [
    { label: 'My Open Cases', value: myOpenCases.length, color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Pending Approval', value: myPendingApprovals.length, color: 'bg-purple-500', textColor: 'text-purple-600 dark:text-purple-400' },
    { label: 'Overdue', value: myOverdueCases.length, color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' },
    { label: 'Resolved', value: myClosedCases.length, color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
  ];

  return (
    <div className="space-y-6">
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
                  <dd className={`text-2xl font-bold ${card.textColor}`}>{card.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Deadlines */}
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
                  <Link 
                    to={`/cases/${caseItem.id}`} 
                    key={caseItem.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
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

        {/* Quick Actions */}
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