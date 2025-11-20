import ApiClient from "./apiClient";
import type { IApiResponse } from "~/types/interfaces/IApiResponse";
import { reformatResponse } from "~/utils/servicesUtils";

const apiClient = new ApiClient();


export const addTbScreeningData = async (params: Record<string, any> = {}): Promise<IApiResponse<any>> => {
  try{
    const response = await apiClient.post<any>("/prevention/tb/add_tb_screening_data", params);
    return reformatResponse(response);
  } catch(e: any){
    return{
      success: false,
      message: `Failed to add TB Screening Data: ${e.message}`,
      data: null
    };
  }
};


export const addTPTReportData = async (params: Record<string, any> = {}): Promise<IApiResponse<any>> => {
  try{
    const response = await apiClient.post<any>("/prevention/tb/add_tpt_report_data", params);
    return reformatResponse(response);
  } catch(e: any){
    return{
      success: false,
      message: `Failed to add TPT Report Data: ${e.message}`,
      data: null
    };
  }
};