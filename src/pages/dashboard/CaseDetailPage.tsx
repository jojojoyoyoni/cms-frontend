import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCases, useRequestClosure, useApproveClosure, useRejectClosure } from '../../api/hooks/useCases';
import { useAuthStore } from '../../store/slices/authSlice';
import { useCaseNotes, useCreateCaseNote } from '../../api/hooks/useCaseNotes';
import { useCaseDocuments, useUploadCaseDocument } from '../../api/hooks/useCaseDocuments';
import { useAuditLogs } from '../../api/hooks/useAudits';
import DueStatusBadge from '../../components/tasks/DueStatusBadge';

import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../api/hooks/useTasks';
import type { Task } from '../../types/task';

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { user } = useAuthStore();

  const caseId = Number(id);
  
  // const { data: cases } = useCases();
  const { data: paginatedData, isLoading } = useCases();
  const cases = paginatedData?.results || [];
  const caseItem = cases?.find(c => c.id === caseId);
  

  const { data: notes } = useCaseNotes(caseId);
  const createNoteMutation = useCreateCaseNote();
  
  const { data: documents } = useCaseDocuments(caseId);
  const uploadDocumentMutation = useUploadCaseDocument();

  const [noteContent, setNoteContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const requestClosureMutation = useRequestClosure();
  const approveClosureMutation = useApproveClosure();

  const rejectClosureMutation = useRejectClosure();
  const [closureNotes, setClosureNotes] = useState('');

  const [showClosureModal, setShowClosureModal] = useState(false);

  const { data: tasks, isLoading: tasksLoading } = useTasks(caseId);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', due_date: '' });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddNote = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!caseItem) return;
    createNoteMutation.mutate({ case: caseId, content: noteContent, is_internal: true }, {
      onSuccess: () => setNoteContent('')
    });
  };

  const handleFileUpload = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('case', String(caseId));
    formData.append('file', selectedFile);
    uploadDocumentMutation.mutate(formData, {
      onSuccess: () => setSelectedFile(null)
    });
  };

  const handleRequestClosure = () => {
    if (!caseItem) return; // Add this safety check
    requestClosureMutation.mutate({ id: caseItem.id, notes: closureNotes }, {
      onSuccess: () => {
        setShowClosureModal(false);
        setClosureNotes('');
      }
    });
  };

    const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseItem) return;
    const payload = {
      case: caseId,
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority as Task['priority'],
      due_date: taskForm.due_date || null,
    };
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data: payload }, { onSuccess: () => setTaskModalOpen(false) });
    } else {
      createTaskMutation.mutate(payload, { onSuccess: () => { setTaskModalOpen(false); setTaskForm({ title: '', description: '', priority: 'MEDIUM', due_date: '' }); } });
    }
  };

  const handleTaskStatusChange = (task: Task, newStatus: Task['status']) => {
    updateTaskMutation.mutate({ id: task.id, data: { status: newStatus, completed_at: newStatus === 'DONE' ? new Date().toISOString() : null } });
  };


  if (!caseItem) return <div>Case not found. <Link to="/cases" className="text-blue-600">Go back</Link></div>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/cases" className="hover:text-gray-700">Cases</Link>
        <span>/</span>
        <span className="font-mono text-gray-900">{caseItem.case_number}</span>
      </div>

      {/* Case Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{caseItem.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{caseItem.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              caseItem.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
              caseItem.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
              caseItem.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {caseItem.priority}
            </span>
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              caseItem.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : 
              caseItem.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-green-100 text-green-800'
            }`}>
              {caseItem.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 border-t pt-4 text-sm">
          <div><p className="text-gray-500">Due Date</p><p className="font-medium text-gray-900">{caseItem.due_date ? new Date(caseItem.due_date).toLocaleString() : 'N/A'}</p></div>
          <div><p className="text-gray-500">Created</p><p className="font-medium text-gray-900">{new Date(caseItem.created_at).toLocaleDateString()}</p></div>
          {/* <div><p className="text-gray-500">Assigned To</p><p className="font-medium text-gray-900">{caseItem.assigned_to || 'Unassigned'}</p></div>
          <div><p className="text-gray-500">Department</p><p className="font-medium text-gray-900">{caseItem.department || 'N/A'}</p></div> */}
          <div><p className="text-gray-500">Assigned To</p><p className="font-medium text-gray-900">{typeof caseItem.assigned_to === 'object' && caseItem.assigned_to ? caseItem.assigned_to.username : caseItem.assigned_to || 'Unassigned'}</p></div>
          <div><p className="text-gray-500">Department</p><p className="font-medium text-gray-900">{typeof caseItem.department === 'object' && caseItem.department ? caseItem.department.name : caseItem.department || 'N/A'}</p></div>
        </div>
      </div>

      {/* // Add this section right below the Case Header div: */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Case Actions</h2>
        
        <div className="flex flex-wrap gap-3">
          {/* Analyst: Request Closure (Available when OPEN or IN_PROGRESS) */}
          {caseItem.status !== 'CLOSED' && caseItem.status !== 'PENDING_APPROVAL' && (
            <button 
              onClick={() => setShowClosureModal(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600 transition-colors"
            >
              Request Closure
            </button>
          )}

          {/* Team Leader/Org Admin: Approve Closure (Available when PENDING_APPROVAL) */}
          {caseItem.status === 'PENDING_APPROVAL' && user?.role !== 'ANALYST' && (
            <>
              <button 
                onClick={() => approveClosureMutation.mutate(caseItem.id)}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                disabled={approveClosureMutation.isPending}
              >
                {approveClosureMutation.isPending ? 'Approving...' : 'Approve Closure'}
              </button>
              <button 
                onClick={() => rejectClosureMutation.mutate(caseItem.id)}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                disabled={rejectClosureMutation.isPending}
              >
                {rejectClosureMutation.isPending ? 'Rejecting...' : 'Reject & Reopen'}
              </button>
            </>
          )}

          {/* Show Approval Info if Approved */}
          {caseItem.status === 'CLOSED' && caseItem.approved_by && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Approved by User #{caseItem.approved_by} on {new Date(caseItem.approved_at!).toLocaleString()}
            </div>
          )}
        </div>
      </div>
      {/* Closure Request Modal */}
      {showClosureModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Request Case Closure</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This will send the case to your Team Leader for approval.</p>
            <textarea 
              value={closureNotes}
              onChange={(e) => setClosureNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-24 mb-4"
              placeholder="Add resolution notes..."
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowClosureModal(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
              <button 
                onClick={handleRequestClosure}
                className="bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600"
                disabled={requestClosureMutation.isPending}
              >
                {requestClosureMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="grid grid-cols-2 gap-6">
        {/* Case Notes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Case Notes</h2>
          <form onSubmit={handleAddNote} className="mb-6">
            <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} className="w-full p-2 border rounded h-24 mb-2" placeholder="Add a note..." required />
            <div className="flex justify-end">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700" disabled={createNoteMutation.isPending}>
                {createNoteMutation.isPending ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </form>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notes?.map(note => (
              <div key={note.id} className="border-l-2 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">{note.author}</span>
                  <span className="text-xs text-gray-500">{new Date(note.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700">{note.content}</p>
              </div>
            ))}
            {notes?.length === 0 && <p className="text-sm text-gray-500">No notes yet.</p>}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Documents & Evidence</h2>
          <form onSubmit={handleFileUpload} className="mb-6 flex gap-2">
            <input type="file" onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} className="flex-1 text-sm" required />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700" disabled={uploadDocumentMutation.isPending}>
              {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload'}
            </button>
          </form>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {documents?.map(doc => (
              <a key={doc.id} href={doc.file_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-blue-600">{doc.file.split('/').pop()}</p>
                  <p className="text-xs text-gray-500">Uploaded by {String(doc.uploaded_by)} on {new Date(doc.created_at).toLocaleString()}</p>
                </div>
                <span className="text-gray-400 text-sm">Download</span>
              </a>
            ))}
            {documents?.length === 0 && <p className="text-sm text-gray-500">No documents uploaded.</p>}
          </div>
        </div>
      </div>

            {/* Case Tasks */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Case Tasks</h2>
          <button onClick={() => { setEditingTask(null); setTaskForm({ title: '', description: '', priority: 'MEDIUM', due_date: '' }); setTaskModalOpen(true); }} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">+ Add Task</button>
        </div>
        
        {tasksLoading ? (
          <p className="text-sm text-gray-500">Loading tasks...</p>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className={`flex items-center gap-3 p-3 border rounded-lg ${task.status === 'DONE' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : task.due_status === 'OVERDUE' ? 'border-gray-200 dark:border-gray-700 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10' : task.due_status === 'DUE_SOON' ? 'border-gray-200 dark:border-gray-700 border-l-4 border-l-yellow-500' : 'border-gray-200 dark:border-gray-700'}`}>
                 {/* Status Dropdown */}
                <select 
                  value={task.status} 
                  onChange={(e) => handleTaskStatusChange(task, e.target.value as Task['status'])}
                  className="text-xs border border-gray-300 dark:border-gray-600 rounded p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="TO_DO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
                
                {/* Task Info */}
                <div className="flex-1">
                  <p className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${task.status === 'DONE' ? 'line-through text-gray-400' : ''}`}>{task.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {task.assigned_to ? `Assigned: ${task.assigned_to}` : 'Unassigned'} 
                    {task.due_date ? ` · Due: ${new Date(task.due_date).toLocaleDateString()}` : ''}
                  </p>
                  {task.due_status && (
                    <div className="mt-1"><DueStatusBadge dueStatus={task.due_status} /></div>
                  )}
                </div>
                
                {/* Priority Badge */}
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  task.priority === 'URGENT' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                  task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                  task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>{task.priority}</span>
                
                {/* Actions */}
                <button onClick={() => { setEditingTask(task); setTaskForm({ title: task.title, description: task.description || '', priority: task.priority, due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '' }); setTaskModalOpen(true); }} className="text-gray-500 hover:text-gray-700 text-xs">Edit</button>
                <button onClick={() => deleteTaskMutation.mutate(task.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No tasks yet. Break down this case into smaller tasks!</p>
        )}
      </div>

      {/* Task Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
            <form onSubmit={handleTaskSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
                <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-20" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Priority</label>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Due Date</label>
                  <input type="datetime-local" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setTaskModalOpen(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">{createTaskMutation.isPending || updateTaskMutation.isPending ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Timeline (Audit Log) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Activity Timeline</h2>
        <AuditLogList caseId={caseId} />
      </div>
    </div>
  );
}

function AuditLogList({ caseId }: { caseId: number }) {
  const { data: logs, isLoading } = useAuditLogs(caseId);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {logs?.map(log => (
        <div key={log.id} className="border-l-2 border-gray-300 pl-4">
          <p className="text-sm font-medium text-gray-900">
            {log.action} by {String(log.user)}
          </p>
          <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
          <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1">{JSON.stringify(log.changes, null, 2)}</pre>
        </div>
      ))}
      {logs?.length === 0 && <p className="text-sm text-gray-500">No activity recorded.</p>}
    </div>
  );
}