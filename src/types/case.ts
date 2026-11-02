export interface Case {
  id: number;
  case_number: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  due_date: string | null;
  organization: number;
  department: number | { id: number; name: string } | null;
  assigned_to: number | { id: number; username: string } | null;
  created_by: number | { id: number; username: string } | null;
  created_at: string;
  updated_at: string;
  resolution_notes?: string | null; 
  approved_by?: number | null;
  approved_at?: string | null;
}
