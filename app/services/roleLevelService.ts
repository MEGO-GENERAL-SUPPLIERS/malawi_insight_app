import ApiClient from "./apiClient";
import { reformatResponse } from "~/utils/servicesUtils";
import type { IApiResponse } from "~/types/interfaces/IApiResponse";
import type { IRoleLevel } from "~/types/interfaces/IRoleLevelInterfaces";

const apiClient = new ApiClient();

export const fetchRoleLevels = async(params: Record<string, any> = {}): Promise<IApiResponse<IRoleLevel[]>> => {
  try{
    const response = await apiClient.post<IRoleLevel[]>("/role_levels/fetch", params);
    return reformatResponse(response);
  }catch(e: any){
    return {
      success: false, 
      message: `Failed to load role levels: ${e.message}`,
      data: null
    };
  }
};