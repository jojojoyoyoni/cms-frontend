import { useState, useMemo } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../api/hooks/useTasks';
import { useCases } from '../../api/hooks/useCases';
import { useUsers } from '../../api/hooks/useUsers';
import { useAuthStore } from '../../store/slices/authSlice';
import type { Task } from '../../types/task';
import DueStatusBadge from '../../components/tasks/DueStatusBadge';
import KanbanBoard from '../../components/tasks/KanbanBoard';
import { Link } from 'react-router-dom';

export default function TasksPage() {
  const { user } = useAuthStore();
  const { data: tasks, isLoading } = useTasks();
  const { data: paginatedCases } = useCases({ page: 1, ordering: '-created_at' });
  const cases = paginatedCases?.results || [];
  const { data: users } = useUsers();
  
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'TO_DO', priority: 'MEDIUM',
    case: '', assigned_to: '', due_date: '',
  });

  const canAssign = user?.role === 'ORG_ADMIN' || user?.role === 'TEAM_LEADER';
  const canDelete = user?.role === 'ORG_ADMIN' || user?.role === 'TEAM_LEADER';

  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '' || task.status === statusFilter;
      const matchesPriority = priorityFilter === '' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // Calculate KPIs
  const totalTasks = tasks?.length || 0;
  const toDoTasks = tasks?.filter(t => t.status === 'TO_DO').length || 0;
  const inProgressTasks = tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0;
  const doneTasks = tasks?.filter(t => t.status === 'DONE').length || 0;
  const overdueTasks = tasks?.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE'
  ).length || 0;

  const kpiCards = [
    { label: 'Total', value: totalTasks, color: 'bg-gray-500' },
    { label: 'To Do', value: toDoTasks, color: 'bg-blue-500' },
    { label: 'In Progress', value: inProgressTasks, color: 'bg-yellow-500' },
    { label: 'Done', value: doneTasks, color: 'bg-green-500' },
    { label: 'Overdue', value: overdueTasks, color: 'bg-red-500' },
  ];

  const statusTabs = [
    { label: 'All', value: '' },
    { label: 'To Do', value: 'TO_DO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Done', value: 'DONE' },
    { label: 'Blocked', value: 'BLOCKED' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', status: 'TO_DO', priority: 'MEDIUM', case: '', assigned_to: '', due_date: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title, description: task.description || '',
      status: task.status, priority: task.priority,
      case: String(task.case), assigned_to: task.assigned_to ? String(task.assigned_to) : '',
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
    });
    setIsModalOpen(true);
  };

  const handleKanbanStatusChange = (taskId: number, newStatus: Task['status']) => {
    updateTaskMutation.mutate({ 
      id: taskId, 
      data: { 
        status: newStatus, 
        completed_at: newStatus === 'DONE' ? new Date().toISOString() : null 
      } 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Task> = {
      title: formData.title,
      description: formData.description,
      status: formData.status as Task['status'],
      priority: formData.priority as Task['priority'],
      case: Number(formData.case),
      assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
      due_date: formData.due_date || null,
    };
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data: payload }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createTaskMutation.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  if (isLoading) return <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading tasks...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage case sub-tasks and action items</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('list')} 
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              📋 List
            </button>
            <button 
              onClick={() => setViewMode('board')} 
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${viewMode === 'board' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              🗂️ Board
            </button>
          </div>
          <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">+ New Task</button>
        </div>
      </div>



      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpiCards.map(card => (
          <div key={card.label} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 transition-colors duration-200">
            <div className="flex items-center">
              <div className={`flex-shrink-0 h-8 w-8 rounded-full ${card.color} flex items-center justify-center text-white font-bold text-sm`}>{card.value}</div>
              <div className="ml-3"><p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{card.label}</p><p className="text-xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
        {statusTabs.map(tab => (
          <button key={tab.value} onClick={() => setStatusFilter(tab.value)} className={`px-4 py-2 text-sm font-medium transition-colors ${statusFilter === tab.value ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>{tab.label}</button>
        ))}
      </div>

      {/* Search & Priority Filter */}
      <div className="flex gap-4">
        <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm" />
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm">
          <option value="">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Tasks Table */}
       {viewMode === 'board' ? (
        <KanbanBoard tasks={filteredTasks} onStatusChange={handleKanbanStatusChange} />
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Task</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Case</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.map(task => {
              const dueStatus = task.due_status;
              return (
              <tr key={task.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${dueStatus === 'OVERDUE' ? 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10' : dueStatus === 'DUE_SOON' ? 'border-l-4 border-l-yellow-500' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{task.description}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {task.case_number && (
                    <Link to={`/cases/${task.case}`} className="text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs">{task.case_number}</Link>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{task.assigned_to_name || 'Unassigned'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.priority === 'URGENT' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>{task.priority}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select value={task.status} onChange={(e) => updateTaskMutation.mutate({ id: task.id, data: { status: e.target.value as Task['status'], completed_at: e.target.value === 'DONE' ? new Date().toISOString() : null } })} className="text-xs border border-gray-300 dark:border-gray-600 rounded p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value="TO_DO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {task.due_date ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 dark:text-gray-400">{new Date(task.due_date).toLocaleDateString()}</span>
                      <DueStatusBadge dueStatus={task.due_status} />
                    </div>
                  ) : <span className="text-gray-400">N/A</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                  <button onClick={() => openEditModal(task)} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 text-xs font-medium">Edit</button>
                  {canDelete && <button onClick={() => deleteTaskMutation.mutate(task.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 text-xs font-medium">Delete</button>}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        {filteredTasks.length === 0 && (
          <div className="text-center py-12"><p className="text-gray-400 text-4xl mb-2">📋</p><p className="text-sm text-gray-500 dark:text-gray-400">No tasks found.</p></div>
        )}
      </div>
      )}

      {/* Create/Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{editingTask ? 'Edit Task' : 'New Task'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4"><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required /></div>
              <div className="mb-4"><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-20" /></div>
              <div className="mb-4"><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Related Case *</label><select name="case" value={formData.case} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required><option value="">-- Select Case --</option>{cases.map(c => <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>)}</select></div>
              {canAssign && <div className="mb-4"><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Assign To</label><select name="assigned_to" value={formData.assigned_to} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"><option value="">-- Self --</option>{users?.map(u => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}</select></div>}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Priority</label><select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></div>
                <div><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Due Date</label><input type="datetime-local" name="due_date" value={formData.due_date} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" /></div>
              </div>
              {editingTask && <div className="mb-4"><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label><select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"><option value="TO_DO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option><option value="BLOCKED">Blocked</option></select></div>}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">{createTaskMutation.isPending || updateTaskMutation.isPending ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
