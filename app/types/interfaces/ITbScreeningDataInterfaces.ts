// In ITbScreeningDataInterfaces.ts
import type { IFacility } from "./IFacilityInterfaces";
import type { IRole } from "./IRoleInterfaces";

export interface ITbScreeningData{
  id?: number;
  date_captured?: string;
  facility?: IFacility;
  report_month?: string;
  report_date?: string;
  reporter?: {
    id: number; 
    first_name?: string;
    other_names?: string;
    last_name?: string;
    roles?: IRole[];
  },
  data_collectors: (string | number)[];
  editable?: boolean;
  data?: {
    tb_screen_data?: ITbScreenRow[] | [],
    tb_contact_tracing_data?: IContactTracingRow[]
  }
  comments?: string;
}

export interface ITbScreenRow {
  age_group: string;
  indicator: string;
  opd_m: number;
  opd_f: number;
  peads_m: number;
  peads_f: number;
  male_m: number;
  male_f: number;
  female_m: number;
  female_f: number;
  art_m: number;
  art_f: number;
  teen_m: number;
  teen_f: number;
  total: number;
}

export interface IContactTracingRow {
  indicator: string;
  total: number;
}

// Separate interface for form data collection
export interface ITbScreeningFormData {
  facility: IFacility | null;
  report_period: Date | null;
  submitted_by: {
    id: number;
    name: string;
  };
  other_data_collectors: number[]; // array of person IDs
  tb_screen_data: ITbScreenRow[];
  tb_contact_tracing_data: IContactTracingRow[];
  comments: string;
}

export interface ITbScreeningDataResponse{
  id: number;
  meta: any; 
  tb_screen_data: ITbScreenRow[] | [];
  tb_contact_tracing_data: IContactTracingRow[] | [];
  metadata: any[] | [];
}

export interface TbScreeningGridRef {
  getRows: () => { tb_screen_data: ITbScreenRow[]; tb_contact_tracing_data: IContactTracingRow[]; meta: { facility?: any; report_period?: any; comment?: string } };
  validateCurrentStep: () => boolean;
  goToNextStep: () => void;
  goToPrevStep: () => void;
}