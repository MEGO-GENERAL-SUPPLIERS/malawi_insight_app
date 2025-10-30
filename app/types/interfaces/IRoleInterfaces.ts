import type { IPrivilege } from "./IPrivilegeInterfaces";

export interface IRole{
  id: number; 
  name: string;
  void: number;
  role_level_id?: number; 
  role_level?: string;
  void_by?: number | string; 
  void_reason?: string;
  created_at?: string | null;
  updated_at?: string | null;
  privilges?: IPrivilege[] | [] | null;
}