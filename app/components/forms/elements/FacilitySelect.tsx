import React from "react";
import type { IFacility } from "~/types/interfaces/IFacilityInterfaces";
import { fetchFacilities } from "~/services/facilityService";
import { CustomSelect } from "~/components/generic_components/CustomSelect";

interface FacilitySelectProps {
  value?: IFacility[];
  multiple?: boolean;
  onChange: (payload: { data: IFacility[]; valid: boolean }) => void;
  label?: string;
  disabled?: boolean;
  refreshable?: boolean;
  validate?: boolean;
  facilityFilters?: number[]; // filter key e.d dsitricts: [1,3]
  requiredMessage?: string;
  searchable?: boolean;
}

const FacilitySelect: React.FC<FacilitySelectProps> = ({
  value = [],
  multiple = false,
  onChange,
  label = "Facility",
  disabled = false,
  refreshable = true,
  validate = false,
  facilityFilters,
  requiredMessage = "Facility selection required.",
  searchable = false,
}) => {
  
  const fetchFacilitiesAdapter = async (filters?: Record<string, any>) => {
    console.log("Facility Filters (District IDs", filters);
    const response = await fetchFacilities(filters);
    return response.data || []; 
  };

  const handleChange = (payload: { data: IFacility | IFacility[] | null; valid: boolean }) => {
      const data = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];
      onChange({ data, valid: payload.valid });
    };

  return (
    <CustomSelect<IFacility>
      value={value}
      multiple={multiple}
      onChange={handleChange}
      label={label}
      disabled={disabled}
      refreshable={refreshable}
      validate={validate}
      requiredMessage={requiredMessage}
      searchable={searchable}
      fetchItems={fetchFacilitiesAdapter}
      filterBy={facilityFilters && facilityFilters.length > 0 ? { district_ids: facilityFilters } : undefined}
    />
  );
};

export default FacilitySelect;

