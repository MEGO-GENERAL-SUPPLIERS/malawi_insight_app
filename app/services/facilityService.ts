import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { type IFacility } from "~/types/interfaces/IFacilityInterfaces";
import { reformatResponse } from '~/utils/servicesUtils';
import ApiClient from "./apiClient";
import { fetchDistricts } from "./districtService";

const apiClient = new ApiClient();

export const fetchFacilities = async (params: Record<string, any> = {}): Promise<IApiResponse<IFacility[]>> => {
  try{
    const response = await apiClient.post<IFacility[]>("/facilities/fetch", params); 
    return reformatResponse(response);
  }catch(error: any){
    return{
      success: false,
      message: `Failed to fetch facilities: ${error.message}`,
      data: null
    };
  }
};

export const addFacility = async (params: Record<string, any> = {}): Promise<IApiResponse<IFacility>> => {
  try{
    const response = await apiClient.post<IFacility>("/facilities", params);
    return reformatResponse(response);
  }catch(error: any){
    return{
      success: false,
      message: `Failed to add facility: ${error.message}`,
      data: null
    };
  }
};

export const updateFacility = async (params: Record<string, any> = {}): Promise<IApiResponse<IFacility>> => {
  try{  
    const response = await apiClient.post<IFacility>("/facilities/update", params);
    return reformatResponse(response);
  }catch(error: any){
    return{
      success: false,
      message: `Failed to update facility: ${error.message}`,
      data: null
    };
  }
};

export const deleteFacility = async (params: Record<string, any> = {}): Promise<IApiResponse<IFacility>> => {
  try{
    const response = await apiClient.post<IFacility>("/facilities/delete", params);
    return reformatResponse(response);
  }catch(error: any){
    return {
      success: false,
      message: `Failed to delete facility: ${error.messsage}`,
      data: null
    };
  }
};

//fetch for districts in facility service 
export const fetchFacilityDistricts = async (params: Record<string, any> = {}) => {
  const response = await fetchDistricts(params);
  if(response.success && Array.isArray(response.data)){
    return response.data.map(p => ({ label: p.name, value: p.id }));
  }
  return [];
};