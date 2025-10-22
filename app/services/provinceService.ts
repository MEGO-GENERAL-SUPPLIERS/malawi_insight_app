// services/provinceService.ts
import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { type IProvince } from "~/types/interfaces/IProvinceInterfaces";
import ApiClient from "./apiClient";

const apiClient = new ApiClient();

export const fetchProvinces = async (params: Record<string, any> = {}): Promise<IApiResponse<IProvince>> => {
  try {
    const response = await apiClient.get<IProvince>(
      "/provinces",
      params
    );
    return response; // already IApiResponse<IAuthResponse>
  } catch {
    return {
      success: false,
      message: "Failed to fetch provinces",
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
    return response; // already IApiResponse<IAuthResponse>
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
    return response; // already IApiResponse<IAuthResponse>
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
      "/provinces/delete",
      params
    );
    return response; // already IApiResponse<IAuthResponse>
  } catch {
    return {
      success: false,
      message: "Failed to fetch provinces",
      data: null,
    };
  }
};