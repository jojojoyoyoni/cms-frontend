import { useState } from 'react';
import { useCases, useCreateCase } from '../../api/hooks/useCases';
import { useAuditLogs } from '../../api/hooks/useAudits';

export default function CasesPage() {
  const { data: cases, isLoading, isError } = useCases();
  const createCaseMutation = useCreateCase();
  
  const [historyCaseId, setHistoryCaseId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'OPEN' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createCaseMutation.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ title: '', description: '', status: 'OPEN' });
      }
    });
  };

  if (isLoading) return <div className="animate-pulse text-gray-500">Loading cases...</div>;
  if (isError) return <div className="text-red-500">Error loading cases.</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">All Cases</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          + New Case
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            {/* Added Actions Header */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cases?.map(caseItem => (
            <tr key={caseItem.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{caseItem.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{caseItem.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  caseItem.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : 
                  caseItem.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {caseItem.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(caseItem.created_at).toLocaleDateString()}
              </td>
              {/* Moved History button to its own column */}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button 
                  onClick={() => setHistoryCaseId(caseItem.id)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  History
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* Create Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Create New Case</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  className="w-full p-2 border rounded" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  className="w-full p-2 border rounded h-24" 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange} 
                  className="w-full p-2 border rounded"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              
              {createCaseMutation.isError && (
                <p className="text-red-500 text-sm mb-4">Error creating case. Make sure you are assigned to an Organization.</p>
              )}

              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                  disabled={createCaseMutation.isPending}
                >
                  {createCaseMutation.isPending ? 'Saving...' : 'Save Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Log Modal (Placed OUTSIDE the Create Case Modal) */}
      {historyCaseId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Case History (#{historyCaseId})</h3>
              <button onClick={() => setHistoryCaseId(null)} className="text-gray-500 hover:text-gray-700">✖</button>
            </div>
            
            <AuditLogList caseId={historyCaseId} />
          </div>
        </div>
      )}
    </div>
  );
}

function AuditLogList({ caseId }: { caseId: number }) {
  const { data: logs, isLoading } = useAuditLogs(caseId);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      {logs?.map(log => (
        <div key={log.id} className="border-l-2 border-blue-500 pl-4">
          <p className="text-sm font-medium text-gray-900">
            {log.action} by {String(log.user)}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(log.timestamp).toLocaleString()}
          </p>
          <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1">
            {JSON.stringify(log.changes, null, 2)}
          </pre>
        </div>
      ))}
      {logs?.length === 0 && <p className="text-sm text-gray-500">No history found.</p>}
    </div>
  );
}