import type { ICountry } from "./ICountryInterfaces";
import type { IDistrict } from "./IDistrictInterfaces";
import type { IFacility } from "./IFacilityInterfaces";
import type { IPrivilege } from "./IPrivilegeInterfaces";
import type { IProvince } from "./IProvinceInterfaces";
import type { IRole } from "./IRoleInterfaces";
import type { IRoleLevel } from "./IRoleLevelInterfaces";
import type { IGender } from "./IGenderInterfaces";
import type { IContact } from "./IContactInterfaces";

export interface IUser{
  id: number; 
  first_name: string; 
  other_names?: string; 
  last_name: string; 
  username?: string;
  date_of_birth?: string;
  password?: string;
  status?: string;
  gender?: IGender | null;
  gender_id?: number;
  gender_name?: string;
  national_id?: string;
  contacts?:  IContact[] | [];
  role_level?: IRoleLevel;
  roles: IRole[] | [];
  locations?: {
    countries?: ICountry[] | []; 
    provinces?: IProvince[] | [];
    districts?: IDistrict[] | []; 
    facilities?: IFacility[] | [];
  },
  custom_user_privileges?: IPrivilege[] | [];
  creator?: {};
  void?: number;
  void_by?: string; 
  void_reason?: string;
};