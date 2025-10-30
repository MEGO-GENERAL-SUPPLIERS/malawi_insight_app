import ApiClient from "./apiClient";
import type { IApiResponse } from "~/types/interfaces/IApiResponse";
import { reformatResponse } from "~/utils/servicesUtils";

const apiClient = new ApiClient();

export const testApiConnection = async (): Promise<IApiResponse<any>> => {
  try{
    const response = await apiClient.get<any>("/network/test");
    return reformatResponse(response);
  }catch(error: any){
    return{
      success: false,
      message: `Failed to reach API: ${error.message}`,
      data: null
    }
  }
};