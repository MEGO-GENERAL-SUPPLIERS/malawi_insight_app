// services/apiClient.ts
import axios, { type AxiosRequestConfig } from "axios";
import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { localStorageUtils, DEFAULT_APP_STRUCTURE } from "~/utils/localStorageUtils";

export default class ApiClient {
  // Dynamically create Axios instance for each request
  private getAxiosInstance() {
    const appStorage = localStorageUtils.ensureLocalAppStructure();
    const apiConfig = appStorage.api || DEFAULT_APP_STRUCTURE.api;

    let baseURL = `${apiConfig.protocol}://${apiConfig.server}`;
    if (apiConfig.port && apiConfig.port !== "80" && apiConfig.port !== "443") {
      baseURL += `:${apiConfig.port}`;
    }
    if (apiConfig.base) {
      baseURL += `/${apiConfig.base.replace(/^\/|\/$/g, "")}`;
    }

    const instance = axios.create({
      baseURL,
      timeout: apiConfig.timeout || 10000,
      headers: { "Content-Type": "application/json" },
    });

    if (apiConfig.token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${apiConfig.token}`;
    }

    return instance;
  }

  private handleSuccess<T>(data: any, message = "Request successful"): IApiResponse<T> {
    if (data && typeof data === "object" && "success" in data && "message" in data && "data" in data) {
      return data as IApiResponse<T>;
    }
    return { success: true, message, data };
  }

  private handleError<T>(error: any): IApiResponse<T> {
    let message = "An error occurred";
    let status = 0;

    if (axios.isAxiosError(error)) {
      status = error.response?.status || 0;
      if (error.response) {
        message = error.response.data?.message || error.response.statusText || message;
      } else if (error.request) {
        message = "No response received from server";
      } else {
        message = error.message;
      }
    } else {
      message = String(error);
    }

    return {
      success: false,
      message,
      data: null as unknown as T,
      metadata: { status },
    };
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const instance = this.getAxiosInstance();
      const response = await instance.get(url, config);
      return this.handleSuccess<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const instance = this.getAxiosInstance();
      const response = await instance.post(url, data, config);
      return this.handleSuccess<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const instance = this.getAxiosInstance();
      const response = await instance.put(url, data, config);
      return this.handleSuccess<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const instance = this.getAxiosInstance();
      const response = await instance.delete(url, config);
      return this.handleSuccess<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }
}
