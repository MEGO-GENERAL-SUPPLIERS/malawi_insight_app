import React from "react";
import type { IDistrict } from "~/types/interfaces/IDistrictInterfaces";
import { fetchDistricts } from "~/services/districtService";
import { CustomSelect } from "~/components/generic_components/CustomSelect";

interface DistrictSelectProps {
  value?: IDistrict[];
  multiple?: boolean;
  onChange: (payload: { data: IDistrict[]; valid: boolean }) => void;
  label?: string;
  disabled?: boolean;
  refreshable?: boolean;
  validate?: boolean;
  districtFilters?: number[]; // filter key e.g. countyies: [1, ...]
  requiredMessage?: string;
  searchable?: boolean;
}

const DistrictSelect: React.FC<DistrictSelectProps> = ({
  value = [],
  multiple = false,
  onChange,
  label = "District",
  disabled = false,
  refreshable = true,
  validate = false,
  districtFilters,
  requiredMessage = "District selection required.",
  searchable = false,
}) => {
  
  const fetchDistrictsAdapter = async (filters?: Record<string, any>) => {
    const response = await fetchDistricts(filters);
    return response.data || []; 
  };

  const handleChange = (payload: { data: IDistrict | IDistrict[] | null; valid: boolean }) => {
    const data = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];
    onChange({ data, valid: payload.valid });
  };

  return (
    <CustomSelect<IDistrict>
      value={value}
      multiple={multiple}
      onChange={handleChange}
      label={label}
      disabled={disabled}
      refreshable={refreshable}
      validate={validate}
      requiredMessage={requiredMessage}
      searchable={searchable}
      fetchItems={fetchDistrictsAdapter}
      filterBy={districtFilters && districtFilters.length > 0 ? { province_ids: districtFilters } : undefined}
    />
  );
};

export default DistrictSelect;

