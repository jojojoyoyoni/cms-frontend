import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { User } from '../../types/user';
import { useThemeStore } from '../../store/slices/themeSlice';

const ROLE_COLORS = {
  SUPERADMIN: '#ef4444',
  ORG_ADMIN: '#8b5cf6',
  TEAM_LEADER: '#3b82f6',
  ANALYST: '#10b981',
};

export default function UserCharts({ users }: { users: User[] }) {
  const { isDarkMode } = useThemeStore();
  const textColor = isDarkMode ? '#9ca3af' : '#4b5563';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';

  // Data for Roles Pie Chart
  const roleData = Object.keys(ROLE_COLORS).map(role => ({
    name: role.replace('_', ' '),
    value: users.filter(u => u.role === role).length
  })).filter(item => item.value > 0);

  // Data for Active vs Inactive
  const statusData = [
    { name: 'Active', value: users.filter(u => u.is_active !== false).length },
    { name: 'Inactive', value: users.filter(u => u.is_active === false).length },
  ];
  const statusColors = ['#10b981', '#ef4444'];

  // Data for Users by Org (Only meaningful if Super Admin)
  const orgData = users.reduce((acc, user) => {
    const orgName = user.organization?.name || 'Unassigned';
    const existing = acc.find(item => item.name === orgName);
    if (existing) {
      existing.Users += 1;
    } else {
      acc.push({ name: orgName, Users: 1 });
    }
    return acc;
  }, [] as { name: string, Users: number }[]);

  const tooltipStyle = { 
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', 
    border: `1px solid ${gridColor}`, 
    borderRadius: '0.5rem', 
    color: isDarkMode ? '#f3f4f6' : '#111827' 
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Bar Chart: Users by Org */}
      {orgData.length > 1 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 lg:col-span-2 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Users by Organization</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={orgData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} />
              <YAxis tick={{ fontSize: 12, fill: textColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pie Chart: Users by Role */}
      <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200 ${orgData.length > 1 ? '' : 'lg:col-span-2'}`}>
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Users by Role</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fill: textColor, fontSize: 12 }}>
              {roleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.name.replace(' ', '_') as keyof typeof ROLE_COLORS]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: textColor }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Donut Chart: Active vs Inactive */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 lg:col-span-3 transition-colors duration-200">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Active vs Inactive Users</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label={{ fill: textColor, fontSize: 12 }}>
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: textColor }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}