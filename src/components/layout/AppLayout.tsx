// src/components/layout/AppLayout.tsx
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/slices/authSlice';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['SUPERADMIN', 'ORG_ADMIN', 'TEAM_LEADER', 'ANALYST'] },
    { label: 'Cases', path: '/cases', roles: ['SUPERADMIN', 'ORG_ADMIN', 'TEAM_LEADER', 'ANALYST'] },
    { label: 'Manage Users', path: '/users', roles: ['ORG_ADMIN', 'SUPERADMIN'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Enterprise CMS</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems
            .filter(item => user && item.roles.includes(user.role))
            .map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`block p-2 rounded transition-colors ${
                  location.pathname === item.path ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <p className="text-sm mb-2 text-gray-400">Logged in as: <br/> <span className="font-bold text-white">{user?.username}</span></p>
          <button onClick={handleLogout} className="w-full bg-red-600 p-2 rounded text-sm hover:bg-red-700">Logout</button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}