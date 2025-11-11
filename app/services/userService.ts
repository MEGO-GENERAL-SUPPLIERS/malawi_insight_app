import ApiClient from "./apiClient";
import { reformatResponse } from "~/utils/servicesUtils";
import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { type IUser } from "~/types/interfaces/IUserInterfaces";

const apiClient = new ApiClient();

export const fetchUsers = async(params: Record<string, any> = {}): Promise<IApiResponse<IUser[]>> => {
  try{
    const response = await apiClient.post<IUser[]>("/users/fetch", params);
    return reformatResponse(response);
  } catch(e: any){
    return{
      success: false,
      message: `Failed to fetch users: ${e.message}`,
      data: null
    };
  }
}; 


export const addUser = async (params: Record<string, any> = {}): Promise<IApiResponse<IUser>> => {
  try{
    const response = await apiClient.post<IUser>("/users/add", params);
    return reformatResponse(response);
  } catch(e: any){
    return{
      success: false,
      message: `Failed to add user: ${e.message}`,
      data: null
    };
  }
};


export const updateUser = async (params: Record<string, any> = {}): Promise<IApiResponse<IUser>> => {
  try{
    const response = await apiClient.post<IUser>("/users/update", params);
    return reformatResponse(response);
  } catch(ex: any){
    return {
      success: false,
      message: `Failed to update user. ${ex.message}`,
      data: null
    };
  }
};


export const deleteRole = async (params: Record<string, any> = {}): Promise<IApiResponse<IUser>> => {
  try{
    const response = await apiClient.post<IUser>("/users/delete", params);
    return reformatResponse(response);
  }catch(e: any){
    return{
      success: false,
      message: `Failed to delete user: ${e.message}`,
      data: null
    };
  }
};