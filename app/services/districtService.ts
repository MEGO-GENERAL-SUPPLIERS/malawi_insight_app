import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { type IDistrict } from "~/types/interfaces/IDistrictInterdaces";
import { formatError } from '~/utils/servicesUtils';
import ApiClient from "./apiClient";
import { fetchProvince } from "./provinceService";

const apiClient = new ApiClient();

export const fetchDistrict = async (params: Record<string, any> = {}): Promise<IApiResponse<IDistrict>> => {
  try{
    const response = await apiClient.post<IDistrict>("/districts/fetch", params); 
    return formatError(response);
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
    return formatError(response);
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
    return formatError(response);
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
    return formatError(response);
  }catch(error: any){
    return {
      success: false,
      message: `Failed to delete district: ${error.messsage}`,
      data: null
    };
  }
};

//fetch for provinces in district service 
export const fetchDistrictProvinces = async () => {
  const response = await fetchProvince();
  if(response.success && Array.isArray(response.data)){
    return response.data.map(p => ({ label: p.name, value: p.id }));
  }
  return [];
};