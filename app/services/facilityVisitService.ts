import ApiClient from "./apiClient";
import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import type { IFacilityVisitFormData } from "~/types/interfaces/IFacilityVisit";
import { formattingUtils } from "~/utils/formattingUtils";
import { reformatResponse } from "~/utils/servicesUtils";

const apiClient = new ApiClient();

export const fetchFacilityVisitData = async (params: Record<string, any> = {}): Promise<IApiResponse<any[]>> => {
  try{
    const response = await apiClient.post<any[]>("/facility_visits/fetch", params); 
    return reformatResponse(response);
  }catch(error: any){
    return{
      success: false,
      message: `Failed to fetch facility visit: ${error.message}`,
      data: null
    };
  }
};


export const addFacilityVisit = async (params: Record<string, any> = {}): Promise<IApiResponse<IFacilityVisitFormData[]>> => {
  try{
    const response = await apiClient.post<IFacilityVisitFormData[]>("/facility_visits/add", params); 
    return reformatResponse(response);
  } catch (error: any){
    return {
      success: false,
      message: `Failed to add faility visit: ${error.message}`,
      data: null
    }
  }
};