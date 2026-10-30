export interface Organization {
  id: number;
  name: string;
  logo: string | null;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  contact_email: string | null; 
  contact_phone: string | null;
  address: string | null;
  country: string | null;
  is_active: boolean;
  created_at: string;
  user_count: number;
  case_count: number;
}