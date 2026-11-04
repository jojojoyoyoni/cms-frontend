import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/slices/authSlice';
import NotificationBell from './NotificationBell';
import { useThemeStore } from '../../store/slices/themeSlice';
import Footer from './Footer';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  

  const navItems = [

        // Operations Section
    { section: 'Operations', label: 'Dashboard', path: '/dashboard', roles: ['ORG_ADMIN', 'TEAM_LEADER', 'ANALYST'], icon: '🏠' },
    { section: 'Operations', label: 'Cases', path: '/cases', roles: ['ORG_ADMIN', 'TEAM_LEADER', 'ANALYST'], icon: '📁' },
    { section: 'Operations', label: 'Reports', path: '/reports', roles: ['ORG_ADMIN', 'TEAM_LEADER', 'ANALYST'], icon: '📊' },
  
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 dark:bg-gray-800 text-white flex flex-col print:hidden">
        <div className="p-4 border-b border-gray-800 dark:border-gray-700">
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
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex items-center justify-end px-6 py-3 gap-4 transition-colors duration-200 print:hidden">
          {/* Dark Mode Toggle Button */}
          <button 
            onClick={toggleDarkMode}
            className="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          {/* Notification Bell */}
          <NotificationBell />

          {/* User Info & Logout */}
          <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-700 pl-4">

            {/* In the header, wrap the user info in a Link */}
            <Link to="/profile" className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-700 pl-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors py-1 px-2 rounded">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role.replace('_', ' ')}</p>
              </div>
              {/* Avatar */}
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold overflow-hidden">
                {user?.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  user?.username?.charAt(0).toUpperCase()
                )}
              </div>
            </Link>

            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors" title="Logout">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

                      {/* Print & Share Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Print Dashboard"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
            
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'My Dashboard',
                    text: 'Check out my CMS Dashboard!',
                    url: window.location.href
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Share Dashboard"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 print:p-0 print:bg-white print:overflow-visible">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}