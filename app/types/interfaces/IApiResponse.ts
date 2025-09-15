// types/interafces/IApiResponse.ts
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}