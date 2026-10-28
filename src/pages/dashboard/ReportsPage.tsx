import StatsCards from '../../components/dashboard/StatsCards';
import { useCases } from '../../api/hooks/useCases';

export default function ReportsPage() {
  const { data: cases, isLoading } = useCases();

  if (isLoading) return <div className="animate-pulse text-gray-500">Generating report...</div>;

  // Calculate percentages
  const total = cases?.length || 0;
  const openCases = cases?.filter(c => c.status === 'OPEN').length || 0;
  const inProgressCases = cases?.filter(c => c.status === 'IN_PROGRESS').length || 0;
  const closedCases = cases?.filter(c => c.status === 'CLOSED').length || 0;

  const getPercentage = (count: number) => total > 0 ? ((count / total) * 100).toFixed(1) : 0;

  const handleExport = () => {
    alert("Export to CSV functionality will be added here!");
    // In a real app, you'd query the backend to download a CSV file
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Case Reports</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            Export to CSV
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
          >
            Print Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <StatsCards />

      {/* Detailed Breakdown Table */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Status Breakdown</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visual</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Open</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{openCases}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getPercentage(openCases)}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm w-1/4">
                <div className="bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${getPercentage(openCases)}%` }}></div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">In Progress</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inProgressCases}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getPercentage(inProgressCases)}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm w-1/4">
                <div className="bg-gray-200 rounded-full h-2.5">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${getPercentage(inProgressCases)}%` }}></div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Closed</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{closedCases}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getPercentage(closedCases)}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm w-1/4">
                <div className="bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${getPercentage(closedCases)}%` }}></div>
                </div>
              </td>
            </tr>
            <tr className="bg-gray-50 font-bold">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{total}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}