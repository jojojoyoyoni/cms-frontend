import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCases } from '../../api/hooks/useCases';
import { useCaseNotes, useCreateCaseNote } from '../../api/hooks/useCaseNotes';
import { useCaseDocuments, useUploadCaseDocument } from '../../api/hooks/useCaseDocuments';
import { useAuditLogs } from '../../api/hooks/useAudits';

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const caseId = Number(id);
  
  const { data: cases } = useCases();
  const caseItem = cases?.find(c => c.id === caseId);

  const { data: notes } = useCaseNotes(caseId);
  const createNoteMutation = useCreateCaseNote();
  
  const { data: documents } = useCaseDocuments(caseId);
  const uploadDocumentMutation = useUploadCaseDocument();

  const [noteContent, setNoteContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseItem) return;
    createNoteMutation.mutate({ case: caseId, content: noteContent, is_internal: true }, {
      onSuccess: () => setNoteContent('')
    });
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('case', String(caseId));
    formData.append('file', selectedFile);
    uploadDocumentMutation.mutate(formData, {
      onSuccess: () => setSelectedFile(null)
    });
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
          <div><p className="text-gray-500">Assigned To</p><p className="font-medium text-gray-900">{caseItem.assigned_to || 'Unassigned'}</p></div>
          <div><p className="text-gray-500">Department</p><p className="font-medium text-gray-900">{caseItem.department || 'N/A'}</p></div>
        </div>
      </div>

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