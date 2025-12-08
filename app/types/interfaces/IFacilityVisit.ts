import type { Dayjs } from "dayjs";

export interface IFacilityVisitDataRef {
  getRows: () => IFacilityVisitFormData;
  validateCurrentStep: () => boolean;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  resetForm: () => void;
}


export interface IFacilityVisitFormData {
  facility: any | null;
  date_of_visit: Dayjs | null;
  team_lead: string; 
  facility_staff_member: string;
  team_members: ITeamMemberEntry[] | [];
  objectives: IVisitObjective[] | [];
  visited_team: IVisitedTeam[] | [];
  findings: IVisitFinding[] | [];
  recommendation_actions: IVisitRecommendationAction[] | [];
  quality_improvement: IQualityImprovement[] | [];
  quality_improvement_enabled: string | number; 
  comment: string;
  reported_by?: {}
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