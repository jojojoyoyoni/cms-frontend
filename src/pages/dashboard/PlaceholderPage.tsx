import { useParams } from 'react-router-dom';

export default function PlaceholderPage() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center transition-colors duration-200">
      <p className="text-6xl mb-4">🚧</p>
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Coming Soon</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">This page is under development.</p>
    </div>
  );
}