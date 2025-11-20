import ApiClient from "./apiClient";
import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { reformatResponse } from "~/utils/servicesUtils";

const apiClient = new ApiClient();

export const fetchFacilityVisits = async (params: Record<string, any> = {}): Promise<IApiResponse<any[]>> => {
  try{
    const response = await apiClient.post<any[]>("/facility_visits/fetch", params); 
    return reformatResponse(response);
  }catch(error: any){
    return{
      success: false,
      message: `Failed to fetch districts: ${error.message}`,
      data: null
    };
  }
};