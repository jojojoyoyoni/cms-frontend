import { useState } from 'react';
import { useNotifications, useMarkNotificationRead } from '../../api/hooks/useNotifications';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const { data: notifications, isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const handleClick = (id: number) => {
    markReadMutation.mutate(id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && <span className="text-xs text-red-500 font-medium">{unreadCount} unread</span>}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="p-4 text-sm text-gray-500">Loading...</p>
            ) : (
              notifications?.map(note => (
                <Link 
                  to={note.case_id ? `/cases/${note.case_id}` : '#'} 
                  key={note.id}
                  onClick={() => handleClick(note.id)}
                  className={`block p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!note.is_read ? 'bg-blue-50' : ''}`}
                >
                  <p className={`text-sm ${!note.is_read ? 'font-bold' : 'font-medium'} text-gray-900`}>{note.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(note.created_at).toLocaleString()}</p>
                </Link>
              ))
            )}
            {notifications?.length === 0 && <p className="p-4 text-sm text-gray-500 text-center">No notifications yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}