import { useDashboardStats } from '../../api/hooks/useReports';

export default function StatsCards() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading || !stats) return <div className="animate-pulse">Loading stats...</div>;

  const cards = [
    { label: 'Total Cases', value: stats.total_cases, color: 'bg-gray-500' },
    { label: 'Open', value: stats.open_cases, color: 'bg-blue-500' },
    { label: 'In Progress', value: stats.in_progress_cases, color: 'bg-yellow-500' },
    { label: 'Closed', value: stats.closed_cases, color: 'bg-green-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.label} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 h-10 w-10 rounded-full ${card.color} flex items-center justify-center text-white font-bold`}>
                {card.value}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{card.label}</dt>
                  <dd className="text-2xl font-bold text-gray-900">{card.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}