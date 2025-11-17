import type { IGender } from "./IGenderInterfaces";

export interface IPerson {
  id: number;
  first_name: string;
  other_names?: string;
  last_name: string;
  position?: string;
  gender?: IGender | null; 
  national_id?: string;
  void?: number; 
}