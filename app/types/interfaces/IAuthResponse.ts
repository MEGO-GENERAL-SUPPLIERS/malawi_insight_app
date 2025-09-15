export interface IAuthResponse {
  userId: number;
  personId: number;
  firstName: string;
  otherNames?: string | null;
  lastName: string;
  username: string;
  nationalId?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  status: string;
  roles: string[];
  privileges: string[];
  accessToken: string;
  refreshToken: string;
  twoFactorEnabled: boolean;
  lockoutEnabled: boolean;
}