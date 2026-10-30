import { useAuditLogs } from '../../api/hooks/useAudits';
import { Link } from 'react-router-dom';

export default function AuditLogsPage() {
  const { data: logs, isLoading, isError } = useAuditLogs();

  if (isLoading) return <div className="animate-pulse text-gray-500">Loading audit logs...</div>;
  if (isError) return <div className="text-red-500">Error loading audit logs.</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Audit Logs</h2>
        <p className="text-sm text-gray-500">{logs?.length} total events</p>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Changes</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs?.map(log => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {String(log.user)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  log.action === 'CREATED' ? 'bg-green-100 text-green-800' :
                  log.action === 'UPDATED' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {log.action}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {log.case_number ? (
                  <Link to={`/cases/${log.case_number}`} className="text-blue-600 hover:text-blue-800">
                    {log.case_number} - {log.case_title}
                  </Link>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {JSON.stringify(log.changes, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {logs?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">No audit logs found.</p>
        </div>
      )}
    </div>
  );
}