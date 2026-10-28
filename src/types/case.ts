export interface Case {
  id: number;
  case_number: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  due_date: string | null;
  organization: number;
  department: number | null;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
}