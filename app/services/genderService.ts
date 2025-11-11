import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { type IGender } from "~/types/interfaces/IGenderInterfaces";
import { reformatResponse } from '~/utils/servicesUtils';
import ApiClient from "./apiClient";

const apiClient = new ApiClient();

export const fetchGenders = async (_params: Record<string, any> = {}): Promise<IApiResponse<IGender[]>> => {
  try{
    // const response = await apiClient.post<IGender[]>("/genders/fetch", params); 
    // return reformatResponse(response);
    return reformatResponse({
      success: true,
      message: `Genders retrieved successfully`,
      data: [
        { id: 1, name: "Male"}, { id: 2, name: "Female"}, { id: 3, name: "Prefer not to say"}
      ]
    });
  }catch(error: any){
    return{
      success: false,
      message: `Failed to fetch genders: ${error.message}`,
      data: null
    };
  }
};