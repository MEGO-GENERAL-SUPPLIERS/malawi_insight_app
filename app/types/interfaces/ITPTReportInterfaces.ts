export interface ITPTGridRow {
indicator: string; // e.g., "Total number of clients new on ART (TX New)"
type: 'M' | 'FP' | 'FNP';
values: Record<string, number>; // ageGroupKey => number
}


export interface ITPTStopReasons {
reason: string;
value: number;
}


export interface ITPTReportData {
  meta: {
    facilityId?: number;
    districtId?: number;
    reportPeriod?: string; // YYYY-MM-01 format
  };
  grid: ITPTGridRow[];
  iptStopReasons: Record<string, number>; // reason => number
  threeHpStopReasons: Record<string, number>; // reason => number
  comments?: string;
}

export type TPTReportGridRef = {
  getRows: () => ITPTReportData;
  validateCurrentStep: () => boolean;
  goToNextStep: () => void;
  goToPrevStep: () => void;
};