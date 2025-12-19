import ApiClient from "./apiClient";
import { reformatResponse } from "~/utils/servicesUtils";
import type { IPrivilege } from "~/types/interfaces/IPrivilegeInterfaces"; 
import type { IApiResponse } from "~/types/interfaces/IApiResponse";

const apiClient = new ApiClient();

export const fetchAllPrivileges = async (params: Record<string, any> = {}): Promise<IApiResponse<IPrivilege[]>> => {
  try{
    const response = await apiClient.post<IPrivilege[]>("/privileges/fetch", params);
    return reformatResponse(response);
  }catch(ex: any){
    return {
      success: false,
      message: `Failed to load privileges: ${ex.message}`,
      data: null
    };
  }
};

export const fetchGroupedPrivileges = async (params: Record<string, any> ={}): Promise<IApiResponse<IPrivilege[]>> => {
  try{
    const response = await apiClient.get<IPrivilege[]>("/privileges/fetch_grouped", params);
    return reformatResponse(response);
  }catch(ex: any){
    return {
      success: false,
      message: `Failed to load privileges: ${ex.message}`,
      data: null
    };
  }
};