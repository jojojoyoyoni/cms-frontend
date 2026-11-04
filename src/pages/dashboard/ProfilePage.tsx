import { useState } from 'react';
import { useAuthStore } from '../../store/slices/authSlice';
import { useUpdateProfile, useChangePassword } from '../../api/hooks/useProfile';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [profileData, setProfileData] = useState({ email: user?.email || '' });
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Notification Preferences (UI only for now)
  const [notifPrefs, setNotifPrefs] = useState({
    case_assigned: true,
    case_updated: true,
    approval_requested: true,
    sla_breach: false,
    user_created: false,
  });

  const handleProfileSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', profileData.email);
    if (pictureFile) formData.append('profile_picture', pictureFile);
    updateProfileMutation.mutate(formData, { onSuccess: () => window.location.reload() });
  };

  const handlePasswordSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordError('');
    changePasswordMutation.mutate({ old_password: passwordData.old_password, new_password: passwordData.new_password }, {
      onSuccess: () => {
        setPasswordSuccess(true);
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        setTimeout(() => setPasswordSuccess(false), 3000);
      },
      onError: () => setPasswordError('Incorrect old password.')
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile & Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account, security, and preferences</p>
      </div>

      {/* Profile Banner Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-200">
        {/* Banner Background */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        
        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-16">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="h-28 w-28 rounded-full ring-4 ring-white dark:ring-gray-800 bg-blue-600 text-white flex items-center justify-center text-4xl font-bold overflow-hidden">
                {user?.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  user?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="mb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user?.username}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-400 mb-2">
              <p>Member since {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}</p>
              <p>Last login: {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Profile Information</h2>
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Username</label>
                  <input type="text" value={user?.username || ''} disabled className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                  <input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && setPictureFile(e.target.files[0])} className="text-sm text-gray-500 dark:text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG. Max 2MB.</p>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button type="submit" disabled={updateProfileMutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Security</h2>
            
              {/* 2FA Toggle (Coming Soon) */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">Coming Soon</span>
            </div>

            {/* Change Password Form */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Change Password</h3>
              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">✅ Password changed successfully!</div>
              )}
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">❌ {passwordError}</div>
              )}
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <input type="password" placeholder="Current Password" value={passwordData.old_password} onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })} className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm" required />
                  <input type="password" placeholder="New Password" value={passwordData.new_password} onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm" required />
                  <input type="password" placeholder="Confirm Password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm" required />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={changePasswordMutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                    {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>

                  {/* Notification Preferences (Permission-based) */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Notification Preferences</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Choose which events you want to be notified about. Only permissions you have are shown.
            </p>
            
            <div className="space-y-3">
              {[
                { key: 'case_assigned', label: 'Case Assigned to me', desc: 'When a new case is assigned to you', requiredPermission: 'cases.view' },
                { key: 'case_updated', label: 'Case Updated', desc: 'When a case you are working on is updated', requiredPermission: 'cases.view' },
                { key: 'approval_requested', label: 'Approval Requested', desc: 'When an analyst requests case closure', requiredPermission: 'cases.update' },
                { key: 'sla_breach', label: 'SLA Breach Alert', desc: 'When a case is approaching its deadline', requiredPermission: 'reports.view' },
                { key: 'user_created', label: 'New User Created', desc: 'When a new user is added to the platform', requiredPermission: 'users.manage' },
              ]
                .filter(pref => user?.permissions?.includes(pref.requiredPermission))
                .map(pref => (
                  <div key={pref.key} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{pref.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{pref.desc}</p>
                      <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">Requires: {pref.requiredPermission}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs(prev => ({ ...prev, [pref.key]: !prev[pref.key as keyof typeof prev] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifPrefs[pref.key as keyof typeof notifPrefs] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifPrefs[pref.key as keyof typeof notifPrefs] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              
              {/* If user has no relevant permissions */}
              {(!user?.permissions || user?.permissions.filter(p => p.startsWith('cases.') || p.startsWith('users.') || p.startsWith('reports.')).length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">No notification preferences available for your role.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Account & Permissions */}
        <div className="space-y-6">
          {/* Account Details */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Account Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Role</span><span className="font-medium text-gray-900 dark:text-gray-100">{user?.role.replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Organization</span><span className="font-medium text-gray-900 dark:text-gray-100 text-right">{user?.organization?.name || 'N/A'}</span></div>
                {/* Only show Department for Team Leaders and Analysts */}
              {user?.role !== 'SUPERADMIN' && user?.role !== 'ORG_ADMIN' && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Department</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{user?.department?.name || 'Unassigned'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Your Permissions</h2>
            <div className="space-y-2">
              {user?.permissions?.map(perm => (
                <div key={perm} className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  <span className="text-gray-700 dark:text-gray-300 font-mono">{perm}</span>
                </div>
              ))}
              {(!user?.permissions || user.permissions.length === 0) && <p className="text-sm text-gray-400">No special permissions.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}