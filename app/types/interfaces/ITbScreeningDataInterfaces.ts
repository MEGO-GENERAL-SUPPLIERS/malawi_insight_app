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
  dataCollectors: (string | number)[];
  editable?: boolean;
  data?: {
    section_a?: ITbScreenRow[] | [],
    section_b?: IContactTracingRow[]
  }
  comments?: string;
}

export interface ITbScreenRow {
  ageGroup: string;
  indicator: string;
  opd_m: number;
  opd_f: number;
  ped_m: number;
  ped_f: number;
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
  reportingMonth: Date | null;
  reportedBy: {
    id: number;
    name: string;
  };
  dataCollectors: number[]; // array of person IDs
  sectionA: ITbScreenRow[];
  sectionB: IContactTracingRow[];
  comments: string;
}

export interface TbScreeningGridRef {
  getRows: () => { sectionA: ITbScreenRow[]; sectionB: IContactTracingRow[]; meta: { facilityId?: number; reportPeriod?: any; comment?: string } };
  validateCurrentStep: () => boolean;
  goToNextStep: () => void;
  goToPrevStep: () => void;
}