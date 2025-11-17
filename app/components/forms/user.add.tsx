import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";
import { TextField, Paper, Stack } from "@mui/material";
import type { IUser } from "~/types/interfaces/IUserInterfaces";
import { validationUtils } from "~/utils/validationUtils";

const CountrySelect = React.lazy(() => import("~/components/forms/elements/CountrySelect"));
const ProvinceSelect = React.lazy(() => import("~/components/forms/elements/ProvinceSelect"));
const DistrictSelect = React.lazy(() => import("~/components/forms/elements/DistrictSelect"));
const FacilitySelect = React.lazy(() => import("~/components/forms/elements/FacilitySelect"));
const RoleSelect = React.lazy(() => import("~/components/forms/elements/RoleSelect"));
const RoleLevelSelect = React.lazy(() => import("~/components/forms/elements/RoleLevelSelect"));
const CustomInput = React.lazy(() => import("~/components/generic_components/CustomInput"));
const GenderOptionSelection = React.lazy(() => import("~/components/forms/elements/GenderOptionSelection"));
const ContactSelectInput = React.lazy(() => import("~/components/forms/elements/ContactSelectInput"));

interface UserAddFormProps {
  user?: IUser | null;
}

export interface UserAddFormHandle {
  getFormData: () => IUser;
  resetForm: () => void;
  setFormData: (data: IUser) => void;
}

const DEFAULT_PERSONAL = {
  first_name: "",
  other_names: "",
  last_name: "",
  username: "",
  gender: { id: 0, name: "N" } as { id: number; name: string },
  national_id: "",
  contacts: [] as any[],
  isValidFirstName: false,
  isValidOtherNames: false,
  isValidLastName: false,
  isValidGender: false,
  isValidContact: false,
};

const DEFAULT_ACCESS = {
  role_level: { id: 0, name: "", void: 0 } as any,
  roles: [] as any[],
  isValidRole: false,
};

const DEFAULT_LOCATIONS = {
  countries: [] as any[],
  provinces: [] as any[],
  districts: [] as any[],
  facilities: [] as any[],
};

const UserAddForm = forwardRef<UserAddFormHandle, UserAddFormProps>(({ user }, ref) => {
  const [personal, setPersonal] = useState(() => ({ ...DEFAULT_PERSONAL }));
  const [access, setAccess] = useState(() => ({ ...DEFAULT_ACCESS }));
  const [locations, setLocations] = useState(() => ({ ...DEFAULT_LOCATIONS }));

  // Initialize from user
  useEffect(() => {
    if (!user) return;
    setPersonal({
      ...DEFAULT_PERSONAL,
      first_name: user.first_name ?? "",
      other_names: user.other_names ?? "",
      last_name: user.last_name ?? "",
      username: user.username ?? "",
      gender: (user.gender as any) ?? DEFAULT_PERSONAL.gender,
      national_id: user.national_id ?? "",
      contacts: user.contacts ?? [],
      isValidFirstName: !!user.first_name,
      isValidOtherNames: !!user.other_names,
      isValidLastName: !!user.last_name,
      isValidGender: !!user.gender,
      isValidContact: (user.contacts ?? []).length > 0,
    });

    setAccess({
      ...DEFAULT_ACCESS,
      role_level: (user.role_level as any) ?? DEFAULT_ACCESS.role_level,
      roles: user.roles ?? [],
      isValidRole: (user.roles && user.roles.length > 0) || Boolean(user.role_level),
    });

    setLocations({
      ...DEFAULT_LOCATIONS,
      countries: user.locations?.countries ?? [],
      provinces: user.locations?.provinces ?? [],
      districts: user.locations?.districts ?? [],
      facilities: user.locations?.facilities ?? [],
    });
  }, [user]);

  // Memoized IDs
  const countryIds = useMemo(() => locations.countries.map(c => c.id), [locations.countries]);
  const provinceIds = useMemo(() => locations.provinces.map(p => p.id), [locations.provinces]);
  const districtIds = useMemo(() => locations.districts.map(d => d.id), [locations.districts]);
  const roleLevelIds = useMemo(() => access.role_level ? [access.role_level.id] : [], [access.role_level]);

  const roleLevelName = (access.role_level?.name ?? "").toLowerCase();

  // Determine which fields are visible
  const visibleFields = useMemo(() => {
    const rl = roleLevelName;
    if (rl === "global") return { roles: true, province: false, district: false, facility: false };
    if (rl === "hq" || rl === "province") return { roles: true, province: true, district: false, facility: false };
    if (rl === "district") return { roles: true, province: true, district: !!locations.provinces.length, facility: false };
    if (rl === "facility") return { roles: true, province: true, district: !!locations.provinces.length, facility: !!locations.districts.length };
    return { roles: false, province: false, district: false, facility: false };
  }, [roleLevelName, locations.provinces, locations.districts]);

  // Determine which fields are disabled
  const disabledFields = useMemo(() => {
    const hasCountries = locations.countries.length > 0;
    const hasProvinces = locations.provinces.length > 0;
    const hasDistricts = locations.districts.length > 0;

    switch (roleLevelName) {
      case "global": return { province: true, district: true, facility: true };
      case "hq": return { province: !hasCountries, district: true, facility: true };
      case "province": return { province: !hasCountries, district: true, facility: true };
      case "district": return { province: !hasCountries, district: !hasProvinces, facility: true };
      case "facility": return { province: !hasCountries, district: !hasProvinces, facility: !hasDistricts };
      default: return { province: true, district: true, facility: true };
    }
  }, [roleLevelName, locations.countries, locations.provinces, locations.districts]);

  // ---------- Handlers ----------
  const handleFirstNameChange = useCallback(({ value, valid }: { value: string; valid: boolean }) => 
    setPersonal(prev => ({ ...prev, first_name: value, isValidFirstName: valid })), []);

  const handleOtherNamesChange = useCallback(({ value, valid }: { value: string; valid: boolean }) => 
    setPersonal(prev => ({ ...prev, other_names: value, isValidOtherNames: valid })), []);

  const handleLastNameChange = useCallback(({ value, valid }: { value: string; valid: boolean }) => 
    setPersonal(prev => ({ ...prev, last_name: value, isValidLastName: valid })), []);

  const handleGenderChange = useCallback(
    (payload: { value: { id: number; name: string } | null; valid: boolean }) => {
      setPersonal(prev => ({ ...prev, gender: payload.value ?? DEFAULT_PERSONAL.gender, isValidGender: payload.valid }));
    }, 
  []);

  const handleContactsChange = useCallback(({ data, valid }: { data: any[]; valid: boolean }) => 
    setPersonal(prev => ({ ...prev, contacts: data, isValidContact: valid })), 
  []);

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
    setPersonal(prev => ({ ...prev, username: e.target.value })), []);

  const handleRoleLevelChange = useCallback(({ data, valid }: { data: any[]; valid: boolean }) => {
    const rl = Array.isArray(data) ? data[0] ?? null : data ?? null;
    setAccess(prev => ({ ...prev, role_level: rl, isValidRole: valid, roles: [] }));
  }, []);

  const handleRolesChange = useCallback(({ data, valid }: { data: any[]; valid: boolean }) => 
    setAccess(prev => ({ ...prev, roles: data, isValidRole: valid })), []);

  // ---------- Location Handlers ----------
  const handleCountriesChange = useCallback(({ data }: { data: any[] }) => {
    const hasCountries = data.length > 0;
    setLocations(prev => ({
      ...prev,
      countries: data,
      provinces: hasCountries ? prev.provinces : [],
      districts: hasCountries ? [] : [],
      facilities: hasCountries ? [] : [],
    }));
  }, []);

  const handleProvincesChange = useCallback(({ data }: { data: any[] }) => {
    const hasProvinces = data.length > 0;
    setLocations(prev => ({
      ...prev,
      provinces: data,
      districts: hasProvinces ? prev.districts : [],
      facilities: hasProvinces ? [] : [],
    }));
  }, []);

  const handleDistrictsChange = useCallback(({ data }: { data: any[] }) => {
    const hasDistricts = data.length > 0;
    setLocations(prev => ({
      ...prev,
      districts: data,
      facilities: hasDistricts ? prev.facilities : [],
    }));
  }, []);

  const handleFacilitiesChange = useCallback(({ data }: { data: any[] }) => {
    setLocations(prev => ({ ...prev, facilities: data }));
  }, []);

  // ---------- Expose Methods ----------
  useImperativeHandle(ref, () => ({
    getFormData: () => ({
      id: 0,
      first_name: personal.first_name,
      other_names: personal.other_names,
      last_name: personal.last_name,
      username: personal.username,
      gender: personal.gender,
      national_id: personal.national_id,
      contacts: personal.contacts,
      role_level: access.role_level,
      roles: access.roles,
      custom_privileges: [],
      locations: { 
        countries: locations.countries,
        provinces: locations.provinces,
        districts: locations.districts,
        facilities: locations.facilities,
      },
    } as IUser),
    resetForm: () => {
      setPersonal({ ...DEFAULT_PERSONAL });
      setAccess({ ...DEFAULT_ACCESS });
      setLocations({ ...DEFAULT_LOCATIONS });
    },
    setFormData: (data: IUser) => {
      setPersonal({ 
        ...DEFAULT_PERSONAL,
        first_name: data.first_name ?? "",
        other_names: data.other_names ?? "",
        last_name: data.last_name ?? "",
        username: data.username ?? "",
        gender: (data.gender as any) ?? DEFAULT_PERSONAL.gender,
        national_id: data.national_id ?? "",
        contacts: data.contacts ?? [],
      });
      setAccess({
        ...DEFAULT_ACCESS,
        role_level: (data.role_level as any) ?? DEFAULT_ACCESS.role_level,
        roles: data.roles ?? [],
      });
      setLocations({
        ...DEFAULT_LOCATIONS,
        countries: data.locations?.countries ?? [],
        provinces: data.locations?.provinces ?? [],
        districts: data.locations?.districts ?? [],
        facilities: data.locations?.facilities ?? [],
      });
    },
  }), [personal, access, locations]);

  // ---------- Render ----------
  return (
    <form autoComplete="off" className="w-full">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 space-y-4">
          <Stack spacing={2}>
            <Paper className="p-3 rounded-xl border border-gray-200 bg-gray-50">
              <Stack spacing={2}>
                <CustomInput 
                  label="First name *" 
                  iconName="User" 
                  iconLibrary="lucide" 
                  iconPosition="left" 
                  value={personal.first_name} 
                  validate 
                  validationMessage="First name is required" 
                  validationMethod={validationUtils.isValidInput} 
                  liveValidation 
                  onChange={handleFirstNameChange} 
                />
                <CustomInput 
                  label="Other name" 
                  iconName="User" 
                  iconLibrary="lucide" 
                  iconPosition="left" 
                  value={personal.other_names} 
                  validate={false} 
                  validationMessage="Other name(s) is required" 
                  validationMethod={val => val.length > 0 ? validationUtils.isValidInput(val) : false} 
                  liveValidation 
                  onChange={handleOtherNamesChange} 
                />
                <CustomInput 
                  label="Last name *" 
                  iconName="User" 
                  iconLibrary="lucide" 
                  iconPosition="left" 
                  value={personal.last_name} 
                  validate 
                  validationMessage="Last name is required" 
                  validationMethod={validationUtils.isValidInput} 
                  liveValidation 
                  onChange={handleLastNameChange} 
                />
                <GenderOptionSelection 
                  label={"Gender *"}
                  value={personal.gender} 
                  onChange={handleGenderChange} 
                  validate 
                  validationMessage="Gender selection is required" 
                  direction="row" 
                  radioLabelPosition="right" 
                  refreshable={false} 
                />
              </Stack>
            </Paper>
            <Paper className="p-3 rounded-xl border border-gray-200 bg-gray-50 mt-4">
              <ContactSelectInput 
                label="User's Contact(s)"
                value={personal.contacts} 
                onChange={handleContactsChange} 
                validate 
                liveValidation 
                showErrorMessage={false} 
                refreshable 
                maxFields={2} 
              />
            </Paper>
          </Stack>
        </div>
        <div className="md:w-1/2 space-y-6">
          <Paper className="p-3 rounded-xl border border-gray-200 bg-gray-50">
            <Stack spacing={2}>
              <CountrySelect 
                label="Country *" 
                value={locations.countries} 
                multiple={false} 
                validate 
                countryFilters={[1]} 
                onChange={handleCountriesChange} 
              />
              <RoleLevelSelect 
                label="Role Level *" 
                value={access.role_level} 
                multiple={false} 
                validate 
                roleLevelFilters={[]} 
                onChange={handleRoleLevelChange} 
              />
              {visibleFields.province && (
                <ProvinceSelect 
                  label="Province *" 
                  value={locations.provinces} 
                  multiple 
                  validate 
                  provinceFilters={countryIds} 
                  disabled={disabledFields.province} 
                  onChange={handleProvincesChange} 
                />
              )}
              {visibleFields.district && (
                <DistrictSelect 
                  label="District *" 
                  value={locations.districts} 
                  multiple 
                  validate 
                  districtFilters={provinceIds} 
                  disabled={disabledFields.district} 
                  onChange={handleDistrictsChange} 
                />
              )}
              {visibleFields.facility && (
                <FacilitySelect 
                  label="Facility *" 
                  value={locations.facilities} 
                  multiple 
                  validate 
                  facilityFilters={districtIds} 
                  disabled={disabledFields.facility} 
                  onChange={handleFacilitiesChange} 
                />
              )}
              {visibleFields.roles && (
                <RoleSelect 
                  label="Role *" 
                  value={access.roles} 
                  multiple 
                  validate 
                  roleFilters={roleLevelIds} 
                  onChange={handleRolesChange} 
                />
              )}
              <TextField 
                label="Username *" 
                name="username" 
                size="small" 
                fullWidth 
                value={personal.username} 
                onChange={handleUsernameChange} 
              />
            </Stack>
          </Paper>
        </div>
      </div>
    </form>
  );
});

export default UserAddForm;
