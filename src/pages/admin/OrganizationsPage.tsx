import { useState } from 'react';
import { useOrganizations, useCreateOrganization, useUpdateOrganization } from '../../api/hooks/useOrganizations';
import type { Organization } from '../../types/organization';
import OrgCharts from '../../components/organizations/OrgCharts';
import { useUsers } from '../../api/hooks/useUsers';

export default function OrganizationsPage() {
  const { data: orgs, isLoading } = useOrganizations();
  const { data: users } = useUsers();
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', description: '', website: '', 
    contact_email: '', contact_phone: '', address: '', country: '', manager_id: '' as string, is_active: true 
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const openCreateModal = () => {
    setEditingOrg(null);
    setFormData({ name: '', description: '', website: '', contact_email: '', contact_phone: '', address: '', country: '', manager_id: '', is_active: true });
    setLogoFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (org: Organization) => {
    setEditingOrg(org);
    setFormData({ 
      name: org.name, description: org.description || '', website: org.website || '', 
      contact_email: org.contact_email || '', contact_phone: org.contact_phone || '', 
      address: org.address || '', country: org.country || '', 
      manager_id: org.managers && org.managers.length > 0 ? String(org.managers[0].id) : '', 
      is_active: org.is_active 
    });
    setLogoFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('website', formData.website);
    data.append('contact_email', formData.contact_email);
    data.append('contact_phone', formData.contact_phone);
    data.append('address', formData.address);
    data.append('country', formData.country);
    data.append('is_active', String(formData.is_active));
    if (formData.manager_id) data.append('manager_id', formData.manager_id);
    if (logoFile) data.append('logo', logoFile);

    if (editingOrg) {
      updateMutation.mutate({ id: editingOrg.id, data }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createMutation.mutate(data, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  if (isLoading) return <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading organizations...</div>;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Platform Organizations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all organizations and view platform analytics</p>
        </div>
        <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm">
          + New Organization
        </button>
      </div>

      {/* 1. Organizations Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Organizations List</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Organization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Manager</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Users</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cases</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Website</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {orgs?.map(org => (
              <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {org.logo_url ? (
                      <img src={org.logo_url} alt={org.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {org.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{org.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{org.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {org.managers && org.managers.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                        {org.managers[0].username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{org.managers[0].username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{org.managers[0].email}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">No manager assigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    org.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {org.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{org.user_count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{org.case_count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {org.website ? <a href={org.website} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Visit</a> : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button onClick={() => openEditModal(org)} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xs font-medium mr-2">Edit</button>
                  <button 
                    onClick={() => {
                      const data = new FormData();
                      data.append('is_active', String(!org.is_active));
                      updateMutation.mutate({ id: org.id, data });
                    }}
                    className={`text-xs font-medium ${org.is_active ? 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300' : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300'}`}
                  >
                    {org.is_active ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Analytics & Charts */}
      {orgs && orgs.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Platform Analytics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Visual overview of platform distribution</p>
          </div>
          <OrgCharts orgs={orgs} />
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 max-h-[90vh] overflow-y-auto transition-colors duration-200">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{editingOrg ? 'Edit Organization' : 'Create New Organization'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Organization Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Logo</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files && setLogoFile(e.target.files[0])} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-20" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Website</label>
                <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="https://example.com" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Contact Email</label>
                <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Contact Phone</label>
                <input type="text" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-16" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Country</label>
                <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Organization Manager (Optional)</label>
                <select 
                  value={formData.manager_id} 
                  onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })} 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">-- Select an Org Admin --</option>
                  {users?.filter(u => u.role === 'ORG_ADMIN').map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Only existing Org Admins are shown here.</p>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded" />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}