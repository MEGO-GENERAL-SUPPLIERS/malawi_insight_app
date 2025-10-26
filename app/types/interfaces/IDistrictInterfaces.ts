export interface IDistrict{
  id: number;
  name: string; 
  code?: string;
  void: number | null;
  province_id: number;
  province_name?: string;
  country_id?: number;
  country_name?: string;
  created_at?: string;
  updated_at?: string;
}