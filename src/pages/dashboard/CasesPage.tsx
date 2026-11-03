import { useState, useMemo } from 'react';
import { useCases, useCreateCase, useUpdateCase, useDeleteCase } from '../../api/hooks/useCases';
import { useDepartments } from '../../api/hooks/useDepartments';
import { useUsers } from '../../api/hooks/useUsers';
import { useAuditLogs } from '../../api/hooks/useAudits';
import type { Case } from '../../types/case';
import type { CaseParams } from '../../api/queries/caseQueries';
import { Link } from 'react-router-dom';

export default function CasesPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  
  const [historyCaseId, setHistoryCaseId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [deleteCaseId, setDeleteCaseId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', description: '', status: 'OPEN', priority: 'MEDIUM', due_date: '',
    department: '' as string, assigned_to: '' as string,
  });

  const params: CaseParams = {
    page,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    ordering,
  };

  const { data: paginatedData, isLoading, isError } = useCases(params);
  const { data: departments } = useDepartments();
  const { data: users } = useUsers();
  
  const createCaseMutation = useCreateCase();
  const updateCaseMutation = useUpdateCase();
  const deleteCaseMutation = useDeleteCase();

  const cases = paginatedData?.results || [];
  const totalCount = paginatedData?.count || 0;
  const totalPages = Math.ceil(totalCount / 10);

  const handleSort = (field: string) => {
    const newOrdering = ordering === field ? `-${field}` : field;
    setOrdering(newOrdering);
    setPage(1);
  };

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
    const deptId = typeof caseItem.department === 'object' && caseItem.department ? caseItem.department.id : caseItem.department;
    const assigneeId = typeof caseItem.assigned_to === 'object' && caseItem.assigned_to ? caseItem.assigned_to.id : caseItem.assigned_to;
    setFormData({
      title: caseItem.title, description: caseItem.description || '',
      status: caseItem.status, priority: caseItem.priority, due_date: dueDate,
      department: deptId ? String(deptId) : '', assigned_to: assigneeId ? String(assigneeId) : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const payload: Partial<Case> = {
      title: formData.title, description: formData.description,
      status: formData.status as Case['status'], priority: formData.priority as Case['priority'],
      due_date: formData.due_date || null,
      department: formData.department ? Number(formData.department) : null,
      assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
    };
    if (editingCase) {
      updateCaseMutation.mutate({ id: editingCase.id, data: payload }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createCaseMutation.mutate(payload, { onSuccess: () => { setIsModalOpen(false); setFormData({ title: '', description: '', status: 'OPEN', priority: 'MEDIUM', due_date: '', department: '', assigned_to: '' }); } });
    }
  };

  const handleDelete = () => {
    if (deleteCaseId) { deleteCaseMutation.mutate(deleteCaseId, { onSuccess: () => setDeleteCaseId(null) }); }
  };

  if (isLoading) return <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading cases...</div>;
  if (isError) return <div className="text-red-500">Error loading cases.</div>;

  // Status Tabs Configuration
  const statusTabs = [
    { label: 'All', value: '' },
    { label: 'Open', value: 'OPEN' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Pending', value: 'PENDING_APPROVAL' },
    { label: 'Closed', value: 'CLOSED' },
  ];

  const SortIcon = ({ field }: { field: string }) => (
    <span className="ml-1 inline-block">
      {ordering === field ? '▲' : ordering === `-${field}` ? '▼' : '↕'}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cases</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track all active cases</p>
        </div>
        <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">+ New Case</button>
      </div>

      {/* Status Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === tab.value 
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Priority Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by Case # or Title..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          />
        </div>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm">
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Cases Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th onClick={() => handleSort('case_number')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Case # <SortIcon field="case_number" /></th>
              <th onClick={() => handleSort('title')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Title <SortIcon field="title" /></th>
              <th onClick={() => handleSort('priority')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Priority <SortIcon field="priority" /></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th onClick={() => handleSort('due_date')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Due Date <SortIcon field="due_date" /></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {cases.map(caseItem => (
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
                  }`}>{caseItem.priority}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    caseItem.status === 'OPEN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
                    caseItem.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                    caseItem.status === 'PENDING_APPROVAL' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }`}>{caseItem.status.replace('_', ' ')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {caseItem.due_date ? new Date(caseItem.due_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                  <button onClick={() => setHistoryCaseId(caseItem.id)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 text-xs font-medium">History</button>
                  <button onClick={() => openEditModal(caseItem)} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 text-xs font-medium">Edit</button>
                  <button onClick={() => setDeleteCaseId(caseItem.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 text-xs font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Empty State */}
        {cases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-4xl mb-2">🔍</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">No cases found.</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search term.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} ({totalCount} total cases)
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Previous</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal (Same as before) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{editingCase ? 'Edit Case' : 'Create New Case'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4"><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required /></div>
              <div className="mb-4"><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-20" /></div>
              <div className="mb-4"><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Department</label><select name="department" value={formData.department} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"><option value="">-- Select Department --</option>{departments?.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}</select></div>
              <div className="mb-4"><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Assign To</label><select name="assigned_to" value={formData.assigned_to} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"><option value="">-- Select User --</option>{users?.map(user => <option key={user.id} value={user.id}>{user.username} ({user.role})</option>)}</select></div>
              <div className="mb-4"><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Priority</label><select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></div>
              <div className="mb-4"><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label><select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"><option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option><option value="CLOSED">Closed</option></select></div>
              <div className="mb-4"><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Due Date</label><input type="datetime-local" name="due_date" value={formData.due_date} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" /></div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700" disabled={createCaseMutation.isPending || updateCaseMutation.isPending}>{(createCaseMutation.isPending || updateCaseMutation.isPending) ? 'Saving...' : 'Save Case'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteCaseId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 text-center">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Delete Case?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This case will be hidden but kept for compliance.</p>
            <div className="flex justify-center gap-2">
              <button type="button" onClick={() => setDeleteCaseId(null)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
              <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700" disabled={deleteCaseMutation.isPending}>{deleteCaseMutation.isPending ? 'Deleting...' : 'Confirm Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyCaseId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Case History (#{historyCaseId})</h3>
              <button onClick={() => setHistoryCaseId(null)} className="text-gray-500 dark:text-gray-400">✖</button>
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
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.action} by {String(log.user)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
        </div>
      ))}
      {logs?.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No history found.</p>}
    </div>
  );
}