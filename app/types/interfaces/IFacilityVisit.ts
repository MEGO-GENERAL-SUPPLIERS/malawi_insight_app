import type { Dayjs } from "dayjs";

export interface IFacilityVisitDataRef {
  getRows: () => IFacilityVisitFormData;
  validateCurrentStep: () => boolean;
  goToNextStep: () => void;
  goToPrevStep: () => void;
}


export interface IFacilityVisitFormData {
  facility: any | null;
  dateOfVisit: Dayjs | null;
  teamLead: string; 
  facilityStaffMember: string;
  teamMembers: ITeamMemberEntry[] | [];
  objectives: IVisitObjective[] | [];
  visitedTeam: IVisitedTeam[] | [];
  findings: IVisitFinding[] | [];
  recommendationActions: IVisitRecommendationAction[] | [];
  qualityImprovement: IQualityImprovement[] | [];
  qualityImprovementEnabled: string | number; 
  comment: string;
  reportedBy?: {}
}

export interface ITeamMemberEntry {
  teamMember: string;
  position: string;
  organisation: string;
}

export interface IVisitObjective{
  objective: string;
}

export interface IVisitedTeam{
  teamMember: string; 
  position: string;
  organisation: string;
}

export interface IVisitFinding{
  finding: string;
}

export interface IVisitRecommendationAction{
  recommendationAction: string;
  responsiblePersonnel: string;
  completionDate: Dayjs | string | null; 
}

export interface IQualityImprovement{
  suggestedQI: string;
  goalOutcome: string;
}