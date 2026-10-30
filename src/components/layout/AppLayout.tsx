import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/slices/authSlice';
import NotificationBell from './NotificationBell';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [

        // Operations Section
    { section: 'Operations', label: 'Dashboard', path: '/dashboard', roles: ['ORG_ADMIN', 'TEAM_LEADER', 'ANALYST'], icon: '🏠' },
    { section: 'Operations', label: 'Cases', path: '/cases', roles: ['ORG_ADMIN', 'TEAM_LEADER', 'ANALYST'], icon: '📁' },
    { section: 'Operations', label: 'Reports', path: '/reports', roles: ['ORG_ADMIN', 'TEAM_LEADER'], icon: '📊' },
  
    // Platform Management Section
    { section: 'Platform Management', label: 'Organizations', path: '/organizations', roles: ['SUPERADMIN'], icon: '🏛️' },
    { section: 'Platform Management', label: 'Manage Users', path: '/users', roles: ['SUPERADMIN', 'ORG_ADMIN'], icon: '👥' },
    { section: 'Platform Management', label: 'Audit Logs', path: '/audits', roles: ['SUPERADMIN', 'ORG_ADMIN'], icon: '📜' },
  ];

  const visibleItems = navItems.filter(item => user && item.roles.includes(user.role));
  
  // Get unique sections
  const sections = Array.from(new Set(visibleItems.map(item => item.section)));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Just Navigation) */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Enterprise CMS</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {sections.map(section => (
            <div key={section}>
              {/* Section Header */}
              <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section}
              </h3>
              
              {/* Section Links */}
              <div className="space-y-1">
                {visibleItems.filter(item => item.section === section).map(item => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className={`flex items-center gap-3 p-2 rounded transition-colors ${
                      location.pathname === item.path ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Area (Header + Content) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex items-center justify-end px-6 py-3 gap-4">
          {/* Notification Bell */}
          <NotificationBell />

          {/* User Info & Logout */}
          <div className="flex items-center gap-4 border-l pl-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.role.replace('_', ' ')}</p>
            </div>
            
            {/* User Avatar Placeholder */}
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>

            <button 
              onClick={handleLogout} 
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}