import type { IContactType } from "./IContactTypeInterfaces";

export interface IContact{
  contact_type?: IContactType;
  contact: any;
  status?: string;
}