import ApiClient from "./apiClient";
import { type IRole } from "~/types/interfaces/IRoleInterfaces";
import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { reformatResponse } from "~/utils/servicesUtils";

const apiClient = new ApiClient();

export const fetchRoles = async (params: Record<string, any> = {}): Promise<IApiResponse<IRole[]>> => {
  try{
    const response = await apiClient.post<IRole[]>("/roles/fetch", params); 
    return reformatResponse(response);
  }catch(e: any){
    return{
      success: false,
      message: `Failed to fetch roles: ${e.message}`,
      data: null
    };
  }
};


export const addRole = async (params: Record<string, any> = {}): Promise<IApiResponse<IRole>> => {
  try{
    const response = await apiClient.post<IRole>("/roles/add", params);
    return reformatResponse(response);
  } catch(ex: any){
    return {
      success: false,
      message: `Failed to add role. ${ex.message}`,
      data: null
    };
  }
};


export const updateRole = async (params: Record<string, any> = {}): Promise<IApiResponse<IRole>> => {
  try{
    const response = await apiClient.post<IRole>("/roles/update", params);
    return reformatResponse(response);
  } catch(ex: any){
    return {
      success: false,
      message: `Failed to update role. ${ex.message}`,
      data: null
    };
  }
};


export const deleteRole = async (params: Record<string, any> = {}): Promise<IApiResponse<IRole>> => {
  try{
    const response = await apiClient.post<IRole>("/roles/delete", params);
    return reformatResponse(response);
  }catch(e: any){
    return{
      success: false,
      message: `Failed to delete role: ${e.message}`,
      data: null
    };
  }
};