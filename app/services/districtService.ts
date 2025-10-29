import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { type IDistrict } from "~/types/interfaces/IDistrictInterfaces";
import { reformatResponse } from '~/utils/servicesUtils';
import ApiClient from "./apiClient";
import { fetchProvinces } from "./provinceService";

const apiClient = new ApiClient();

export const fetchDistricts = async (params: Record<string, any> = {}): Promise<IApiResponse<IDistrict[]>> => {
  try{
    const response = await apiClient.post<IDistrict[]>("/districts/fetch", params); 
    return reformatResponse(response);
  }catch(error: any){
    return{
      success: false,
      message: `Failed to fetch districts: ${error.message}`,
      data: null
    };
  }
};

export const addDistrict = async (params: Record<string, any> = {}): Promise<IApiResponse<IDistrict>> => {
  try{
    const response = await apiClient.post<IDistrict>("/districts", params);
    return reformatResponse(response);
  }catch(error: any){
    return{
      success: false,
      message: `Failed to add district: ${error.message}`,
      data: null
    };
  }
};

export const updateDistrict = async (params: Record<string, any> = {}): Promise<IApiResponse<IDistrict>> => {
  try{  
    const response = await apiClient.post<IDistrict>("/districts/update", params);
    return reformatResponse(response);
  }catch(error: any){
    return{
      success: false,
      message: `Failed to update district: ${error.message}`,
      data: null
    };
  }
};

export const deleteDistrict = async (params: Record<string, any> = {}): Promise<IApiResponse<IDistrict>> => {
  try{
    const response = await apiClient.post<IDistrict>("/districts/delete", params);
    return reformatResponse(response);
  }catch(error: any){
    return {
      success: false,
      message: `Failed to delete district: ${error.messsage}`,
      data: null
    };
  }
};

//fetch for provinces in district service 
export const fetchDistrictProvinces = async (params: Record<string, any> = {}) => {
  const response = await fetchProvinces(params);
  if(response.success && Array.isArray(response.data)){
    return response.data.map(p => ({ label: p.name, value: p.id }));
  }
  return [];
};