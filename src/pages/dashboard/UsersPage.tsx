import { useState } from 'react';
import { useUsers, useCreateUser } from '../../api/hooks/useUsers';

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const createUserMutation = useCreateUser();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: 'ANALYST',
    department: null as number | null 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ username: '', email: '', password: '', role: 'ANALYST', department: null });
      }
    });
  };

  if (isLoading) return <div className="animate-pulse text-gray-500">Loading users...</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Organization Users</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          + New User
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users?.map(user => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.role === 'ORG_ADMIN' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'TEAM_LEADER' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.department?.name || 'Unassigned'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Create New User</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full p-2 border rounded">
                  <option value="ANALYST">Analyst</option>
                  <option value="TEAM_LEADER">Team Leader</option>
                  <option value="ORG_ADMIN">Org Admin</option>
                </select>
              </div>
              
              {createUserMutation.isError && (
                <p className="text-red-500 text-sm mb-4">Error creating user. Check permissions.</p>
              )}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}