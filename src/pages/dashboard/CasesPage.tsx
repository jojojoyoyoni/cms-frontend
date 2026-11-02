import { useState } from 'react';
import { useCases, useCreateCase, useUpdateCase, useDeleteCase } from '../../api/hooks/useCases';
import { useDepartments } from '../../api/hooks/useDepartments';
import { useUsers } from '../../api/hooks/useUsers';
import { useAuditLogs } from '../../api/hooks/useAudits';
import type { Case } from '../../types/case';
import { Link } from 'react-router-dom';

export default function CasesPage() {
  const { data: cases, isLoading, isError } = useCases();
  const { data: departments } = useDepartments();
  const { data: users } = useUsers();
  
  const createCaseMutation = useCreateCase();
  const updateCaseMutation = useUpdateCase();
  const deleteCaseMutation = useDeleteCase();
  
  const [historyCaseId, setHistoryCaseId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [deleteCaseId, setDeleteCaseId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ 
    title: '', description: '', status: 'OPEN', priority: 'MEDIUM', due_date: '',
    department: '' as string, 
    assigned_to: '' as string,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setEditingCase(null);
    setFormData({ title: '', description: '', status: 'OPEN', priority: 'MEDIUM', due_date: '', department: '', assigned_to: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (caseItem: Case) => {
    setEditingCase(caseItem);
    const dueDate = caseItem.due_date ? new Date(caseItem.due_date).toISOString().slice(0, 16) : '';
    
    // Handle nested objects for department and assigned_to
    const deptId = typeof caseItem.department === 'object' && caseItem.department ? caseItem.department.id : caseItem.department;
    const assigneeId = typeof caseItem.assigned_to === 'object' && caseItem.assigned_to ? caseItem.assigned_to.id : caseItem.assigned_to;
    
    setFormData({
      title: caseItem.title,
      description: caseItem.description || '',
      status: caseItem.status,
      priority: caseItem.priority,
      due_date: dueDate,
      department: deptId ? String(deptId) : '',
      assigned_to: assigneeId ? String(assigneeId) : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    
    // Cast the payload to match the Case interface
    const payload: Partial<Case> = {
      title: formData.title,
      description: formData.description,
      status: formData.status as Case['status'], // Cast here
      priority: formData.priority as Case['priority'], // Cast here
      due_date: formData.due_date || null,
      department: formData.department ? Number(formData.department) : null,
      assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
    };

    if (editingCase) {
      updateCaseMutation.mutate({ id: editingCase.id, data: payload }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createCaseMutation.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          setFormData({ title: '', description: '', status: 'OPEN', priority: 'MEDIUM', due_date: '', department: '', assigned_to: '' });
        }
      });
    }
  };

  const handleDelete = () => {
    if (deleteCaseId) {
      deleteCaseMutation.mutate(deleteCaseId, {
        onSuccess: () => setDeleteCaseId(null)
      });
    }
  };

  if (isLoading) return <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading cases...</div>;
  if (isError) return <div className="text-red-500">Error loading cases.</div>;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cases</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all active cases</p>
        </div>
        <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm">
          + New Case
        </button>
      </div>

      {/* Cases Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-200">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Case #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {cases?.map(caseItem => (
              <tr key={caseItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 dark:text-blue-400">
                  <Link to={`/cases/${caseItem.id}`}>{caseItem.case_number}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{caseItem.title}</td>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                  <button onClick={() => setHistoryCaseId(caseItem.id)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 text-xs font-medium">History</button>
                  <button onClick={() => openEditModal(caseItem)} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xs font-medium">Edit</button>
                  <button onClick={() => setDeleteCaseId(caseItem.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 text-xs font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 max-h-[90vh] overflow-y-auto transition-colors duration-200">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{editingCase ? 'Edit Case' : 'Create New Case'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-20" />
              </div>
              
              {/* Department Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Department</label>
                <select name="department" value={formData.department} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="">-- Select Department --</option>
                  {departments?.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              {/* Assign To Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Assign To</label>
                <select name="assigned_to" value={formData.assigned_to} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="">-- Select User --</option>
                  {users?.map(user => (
                    <option key={user.id} value={user.id}>{user.username} ({user.role})</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Due Date</label>
                <input type="datetime-local" name="due_date" value={formData.due_date} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors" disabled={createCaseMutation.isPending || updateCaseMutation.isPending}>
                  {(createCaseMutation.isPending || updateCaseMutation.isPending) ? 'Saving...' : 'Save Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCaseId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 text-center transition-colors duration-200">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Delete Case?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This case will be hidden from the system but kept in the database for compliance audit purposes.</p>
            <div className="flex justify-center gap-2">
              <button type="button" onClick={() => setDeleteCaseId(null)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors" disabled={deleteCaseMutation.isPending}>
                {deleteCaseMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {historyCaseId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto transition-colors duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Case History (#{historyCaseId})</h3>
              <button onClick={() => setHistoryCaseId(null)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">✖</button>
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
  if (isLoading) return <p className="text-gray-500 dark:text-gray-400">Loading...</p>;
  return (
    <div className="space-y-4">
      {logs?.map(log => (
        <div key={log.id} className="border-l-2 border-blue-500 pl-4">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {log.action} by {String(log.user)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
        </div>
      ))}
      {logs?.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No history found.</p>}
    </div>
  );
}