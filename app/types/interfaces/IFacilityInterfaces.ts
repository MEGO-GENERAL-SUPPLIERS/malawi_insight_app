export interface IFacility{
  id: number; 
  name: string; 
  code?: string;
  country_id?: number; 
  province_id?: number; 
  district_id?: number; 
  void?: number; 
  created_at?: string;
  updated_at?: string;
}