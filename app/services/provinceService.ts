// services/provinceService.ts
import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { type IProvince } from "~/types/interfaces/IProvinceInterfaces";
import { reformatResponse } from "~/utils/servicesUtils";
import ApiClient from "./apiClient";

const apiClient = new ApiClient();

export const fetchProvinces = async (params: Record<string, any> = {}): Promise<IApiResponse<IProvince[]>> => {
  try {
    console.log("params", params);
    const response = await apiClient.post<IProvince[]>(
      "/provinces/fetch",
      params
    );
    return reformatResponse(response); // already IApiResponse<IAuthResponse>
  } catch(error: any) {
    return {
      success: false,
      message: `Failed to fetch provinces: ${error.message}`,
      data: null,
    };
  }
};

export const addProvince = async (params: Record<string, any> = {}): Promise<IApiResponse<IProvince>> => {
  try {
    const response = await apiClient.post<IProvince>(
      "/provinces",
      params
    );
    return reformatResponse(response); // already IApiResponse<IAuthResponse>
  } catch {
    return {
      success: false,
      message: "Failed to fetch provinces",
      data: null,
    };
  }
};

export const deleteProvince = async (params: Record<string, any> = {}): Promise<IApiResponse<IProvince>> => {
  try {
    const response = await apiClient.post<IProvince>(
      "/provinces/delete",
      params
    );
    return reformatResponse(response); // already IApiResponse<IAuthResponse>
  } catch {
    return {
      success: false,
      message: "Failed to fetch provinces",
      data: null,
    };
  }
};

export const updateProvince = async (params: Record<string, any> = {}): Promise<IApiResponse<IProvince>> => {
  try {
    const response = await apiClient.post<IProvince>(
      "/provinces/update",
      params
    );
    return reformatResponse(response); // already IApiResponse<IAuthResponse>
  } catch {
    return {
      success: false,
      message: "Failed to fetch provinces",
      data: null,
    };
  }
};