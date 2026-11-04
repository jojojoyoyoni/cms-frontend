export interface Task {
  id: number;
  case: number;
  case_number?: string;
  case_title?: string;
  title: string;
  description: string | null;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigned_to: number | null;
  assigned_to_name?: string | null;
  created_by: number | null;
  created_by_name?: string | null;
  due_date: string | null;
  due_status: 'OVERDUE' | 'DUE_SOON' | null;  completed_at: string | null;
  created_at: string;
  updated_at: string;
}