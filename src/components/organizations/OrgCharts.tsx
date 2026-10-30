import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Organization } from '../../types/organization';
import { useThemeStore } from '../../store/slices/themeSlice';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function OrgCharts({ orgs }: { orgs: Organization[] }) {
  const { isDarkMode } = useThemeStore();
  
  // Theme-aware colors
  const textColor = isDarkMode ? '#9ca3af' : '#4b5563'; // gray-400 / gray-600
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb'; // gray-700 / gray-200

  const barData = orgs.map(org => ({ name: org.name, Cases: org.case_count }));
  const pieData = orgs.map(org => ({ name: org.name, value: org.user_count }));
  
  const statusData = [
    { name: 'Active', value: orgs.filter(o => o.is_active).length },
    { name: 'Suspended', value: orgs.filter(o => !o.is_active).length },
  ];
  const statusColors = ['#10b981', '#ef4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Bar Chart: Cases by Org */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 lg:col-span-2 transition-colors duration-200">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Cases by Organization</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} />
            <YAxis tick={{ fontSize: 12, fill: textColor }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${gridColor}`,
                borderRadius: '0.5rem',
                color: isDarkMode ? '#f3f4f6' : '#111827'
              }}
              labelStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
            />
            <Bar dataKey="Cases" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Donut Chart: Active vs Suspended */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Platform Health</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie 
              data={statusData} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              innerRadius={60} 
              outerRadius={80} 
              paddingAngle={5}
              label={{ fill: textColor, fontSize: 12 }}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${gridColor}`,
                borderRadius: '0.5rem',
                color: isDarkMode ? '#f3f4f6' : '#111827'
              }}
            />
            <Legend wrapperStyle={{ color: textColor }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart: Users by Org */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 lg:col-span-3 transition-colors duration-200">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">User Distribution Across Organizations</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie 
              data={pieData} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={100} 
              label={{ fill: textColor, fontSize: 12 }}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${gridColor}`,
                borderRadius: '0.5rem',
                color: isDarkMode ? '#f3f4f6' : '#111827'
              }}
            />
            <Legend wrapperStyle={{ color: textColor }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}