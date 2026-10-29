export interface User {
  id: number;
  username: string;
  email: string;
  role: 'SUPERADMIN' | 'ORG_ADMIN' | 'TEAM_LEADER' | 'ANALYST';
  organization?: { id: number; name: string };
  department?: { id: number; name: string };
  permissions: string[];
}

export interface Case {
  id: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  organization: number;
  department: number | null;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
}
