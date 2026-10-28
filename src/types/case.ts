// src/types/case.ts
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