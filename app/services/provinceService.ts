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