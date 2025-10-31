export interface IPrivilege{
  id: number;
  name: string;
  void: number;
  action_name?: string;
  parent_id?: number;
  children?: IPrivilege[]; // for grouped privileges
  description?: string; 
  created_at?: string; 
  updated_at?: string;
}