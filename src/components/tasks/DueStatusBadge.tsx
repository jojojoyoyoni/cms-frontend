export default function DueStatusBadge({ dueStatus }: { dueStatus: 'OVERDUE' | 'DUE_SOON' | null }) {
  if (!dueStatus) return null;
  if (dueStatus === 'OVERDUE') {
    return <span className="px-1.5 py-0.5 text-xs font-bold rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">⚠️ OVERDUE</span>;
  }
  return <span className="px-1.5 py-0.5 text-xs font-bold rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">⏰ DUE SOON</span>;
}