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
    facility?: any;
    report_period?: string; 
    comment?: string;
    submitted_by: Record<string, any>;
  };
  data: ITPTGridRow[];
  ipt_stop_reasons: Record<string, number>; // reason => number
  three_hp_stop_reasons: Record<string, number>; // reason => number
}

export type TPTReportGridRef = {
  getRows: () => ITPTReportData;
  validateCurrentStep: () => boolean;
  goToNextStep: () => void;
  goToPrevStep: () => void;
};