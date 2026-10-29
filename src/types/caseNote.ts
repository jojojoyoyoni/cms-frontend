export interface CaseNote {
  id: number;
  case: number;
  author: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}