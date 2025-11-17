// services/programPreventionService.ts
import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { type ITbScreeningData } from "~/types/interfaces/ITbScreeningDataInterfaces";
import { reformatResponse } from "~/utils/servicesUtils";
import ApiClient from "./apiClient";

const apiClient = new ApiClient();

export const fetchTbScreeningData = async (params: Record<string, any> = {}): Promise<IApiResponse<ITbScreeningData[]>> => {
  try{  
    const response = await apiClient.post<ITbScreeningData[]>("/prevention/tb_screening", params);
    return reformatResponse(response);
  }catch(e: any){
    return {
      success: false,
      message: `Failed to fetch TB Screening Data: ${e.message}`,
      data: null
    };
  }
};