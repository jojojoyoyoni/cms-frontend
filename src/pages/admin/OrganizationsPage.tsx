import { useState } from 'react';
import { useOrganizations, useCreateOrganization, useUpdateOrganization } from '../../api/hooks/useOrganizations';
import type { Organization } from '../../types/organization';

export default function OrganizationsPage() {
  const { data: orgs, isLoading } = useOrganizations();
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    website: '', 
    contact_email: '', 
    contact_phone: '', 
    address: '', 
    country: '', 
    is_active: true 
  });
 const [logoFile, setLogoFile] = useState<File | null>(null);

  const openCreateModal = () => {
    setEditingOrg(null);
    setFormData({ name: '', description: '', website: '', contact_email: '', contact_phone: '', address: '', country: '', is_active: true });
    setLogoFile(null);
    setIsModalOpen(true);
  };

    const openEditModal = (org: Organization) => {
        setEditingOrg(org);
        setFormData({ 
        name: org.name, 
        description: org.description || '', 
        website: org.website || '', 
        contact_email: org.contact_email || '', 
        contact_phone: org.contact_phone || '', 
        address: org.address || '', 
        country: org.country || '', 
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
    if (logoFile) data.append('logo', logoFile);

    if (editingOrg) {
      updateMutation.mutate({ id: editingOrg.id, data }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createMutation.mutate(data, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  if (isLoading) return <div className="animate-pulse text-gray-500">Loading organizations...</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Platform Organizations</h2>
        <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
          + New Organization
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cases</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orgs?.map(org => (
            <tr key={org.id} className="hover:bg-gray-50">
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
                    <p className="text-sm font-medium text-gray-900">{org.name}</p>
                    <p className="text-xs text-gray-500 max-w-xs truncate">{org.description}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  org.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {org.is_active ? 'Active' : 'Suspended'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{org.user_count}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{org.case_count}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {org.website ? <a href={org.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Visit</a> : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button onClick={() => openEditModal(org)} className="text-gray-600 hover:text-gray-800 text-xs font-medium mr-2">Edit</button>
                <button 
                  onClick={() => {
                    const data = new FormData();
                    data.append('is_active', String(!org.is_active));
                    updateMutation.mutate({ id: org.id, data });
                  }}
                  className={`text-xs font-medium ${org.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                >
                  {org.is_active ? 'Suspend' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{editingOrg ? 'Edit Organization' : 'Create New Organization'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Organization Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Logo</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files && setLogoFile(e.target.files[0])} className="w-full text-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded h-20" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Website</label>
                <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full p-2 border rounded" placeholder="https://example.com" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <input type="text" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-2 border rounded h-16" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Country</label>
                <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div className="mb-4 flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                <label htmlFor="is_active" className="text-sm font-medium">Active</label>
              </div>
              
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700" disabled={createMutation.isPending || updateMutation.isPending}>
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