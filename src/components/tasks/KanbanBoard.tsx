import { useState } from 'react';
import type { Task } from '../../types/task';
import DueStatusBadge from '../tasks/DueStatusBadge';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: number, newStatus: Task['status']) => void;
}

const COLUMNS = [
  { key: 'TO_DO', label: 'To Do', color: 'bg-blue-500' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-500' },
  { key: 'BLOCKED', label: 'Blocked', color: 'bg-red-500' },
  { key: 'DONE', label: 'Done', color: 'bg-green-500' },
];

export default function KanbanBoard({ tasks, onStatusChange }: KanbanBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    if (draggedTaskId !== null) {
      onStatusChange(draggedTaskId, newStatus);
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map(column => {
        const columnTasks = tasks.filter(t => t.status === column.key);
        return (
          <div
            key={column.key}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.key as Task['status'])}
            className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3 min-h-[400px] transition-colors"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${column.color}`}></span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{column.label}</h3>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full">{columnTasks.length}</span>
            </div>

            {/* Task Cards */}
            <div className="space-y-2">
              {columnTasks.map(task => (
                <div
                  key={task.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg p-3 cursor-move border-l-4 transition-all hover:shadow-md ${
                    task.due_status === 'OVERDUE' ? 'border-l-red-500' :
                    task.due_status === 'DUE_SOON' ? 'border-l-yellow-500' :
                    task.priority === 'URGENT' ? 'border-l-red-400' :
                    task.priority === 'HIGH' ? 'border-l-orange-400' :
                    'border-l-gray-300 dark:border-l-gray-600'
                  } ${task.status === 'DONE' ? 'opacity-60' : ''} ${draggedTaskId === task.id ? 'opacity-30' : ''}`}
                >
                  <p className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${task.status === 'DONE' ? 'line-through' : ''}`}>{task.title}</p>
                  
                  {task.case_number && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-1">{task.case_number}</p>
                  )}
                  
                  {task.due_date && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400">📅 {new Date(task.due_date).toLocaleDateString()}</span>
                      <DueStatusBadge dueStatus={task.due_status} />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{task.assigned_to_name || 'Unassigned'}</span>
                    <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      task.priority === 'URGENT' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                      task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>{task.priority}</span>
                  </div>
                </div>
              ))}
              
              {columnTasks.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
                  <p className="text-xs text-gray-400">Drop tasks here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}