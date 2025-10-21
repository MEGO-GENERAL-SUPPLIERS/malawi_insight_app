export interface IProvince{
  id: number; 
  country_id: number | null | undefined;
  name: string; 
  code?: string; 
  void: number; 
  created_at?: string;
  updated_at?: string;   
}