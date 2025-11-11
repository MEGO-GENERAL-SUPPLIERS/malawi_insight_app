import { type IApiResponse } from './../types/interfaces/IApiResponse';
import type { IContactType } from "~/types/interfaces/IContactTypeInterfaces";

export const fetchContactTypes = async (): Promise<IApiResponse<IContactType[]>> => {
  // Replace with actual API call
  return {
    success: true,
    message: `Contact types retrieved successfully`,
    data: [
      { id: 1, name: "Email", type: "email" },
      { id: 2, name: "Phone", type: "phone" },
      { id: 3, name: "WhatsApp", type: "phone" },
    ]
  };
};