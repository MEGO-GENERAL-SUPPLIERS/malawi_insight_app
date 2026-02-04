// services/authService.ts
import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { type IAuthResponse } from "~/types/interfaces/IAuthResponse";
import ApiClient from "./apiClient";

const apiClient = new ApiClient();

export const authenticateUser = async (
  username: string,
  password: string
): Promise<IApiResponse<IAuthResponse>> => {
  try {
    // ✅ only specify the inner payload type
    const response = await apiClient.post<IAuthResponse>(
      "/auth/login",
      { username, password }
    );
    return response; // already IApiResponse<IAuthResponse>
  } catch {
    return {
      success: false,
      message: "Authentication failed",
      data: null,
    };
  }
};


export const checkSuperUser = async (): Promise<IApiResponse<boolean>> => {
  try {
    const response = await apiClient.get<boolean>("auth/superuser/check");
    return response;
  } catch {
    return {
      success: false,
      message: "Failed to check superuser",
      data: null,
    };
  }
};


interface SuperUserPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export const createSuperUser = async (
 payload: SuperUserPayload
): Promise<IApiResponse<boolean>> => {
  try {
    const response = await apiClient.post<boolean>(
      "auth/superuser/create",
      payload
    );
    return response;
  } catch {
    return {
      success: false,
      message: "Failed to create superuser",
      data: null,
    };
  }
};


export const passwordForgot = async(params: Record<string, any>): Promise<any> => {
  try{
    const response = await apiClient.post<any>("auth/forgot-password", params);
    return response;
  } catch(error: any){
    return{
      success: false,
      message: (error.message || "Failed to initiated password reset process"),
      data: null
    };
  }
};


export const passwordReset = async(params: Record<string, any>): Promise<any> => {
  try{
    const response = await apiClient.post<any>("auth/reset-password", params);
    return response;
  } catch(error: any){
    return{
      success: false,
      message: (error.message || "Failed to reset password"),
      data: null
    };
  }
};