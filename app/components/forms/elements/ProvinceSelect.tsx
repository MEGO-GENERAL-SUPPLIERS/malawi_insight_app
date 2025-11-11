import React from "react";
import type { IProvince } from "~/types/interfaces/IProvinceInterfaces";
import { fetchProvinces } from "~/services/provinceService";
import { CustomSelect } from "~/components/generic_components/CustomSelect";

interface ProvinceSelectProps {
  value?: IProvince[];
  multiple?: boolean;
  onChange: (payload: { data: IProvince[]; valid: boolean }) => void;
  label?: string;
  disabled?: boolean;
  refreshable?: boolean;
  validate?: boolean;
  provinceFilters?: number[]; // country IDs
  requiredMessage?: string;
  searchable?: boolean;
}

const ProvinceSelect: React.FC<ProvinceSelectProps> = ({
  value = [],
  multiple = false,
  onChange,
  label = "Province",
  disabled = false,
  refreshable = true,
  validate = false,
  provinceFilters,
  requiredMessage = "Province selection required.",
  searchable = false,
}) => {
  const fetchProvincesAdapter = async (filters?: Record<string, any>) => {
    const response = await fetchProvinces(filters);
    return response.data || [];
  };

  const handleChange = (payload: { data: IProvince | IProvince[] | null; valid: boolean }) => {
    const data = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];
    onChange({ data, valid: payload.valid });
  };

  return (
    <CustomSelect<IProvince>
      value={value}
      multiple={multiple}
      onChange={handleChange}
      label={label}
      disabled={disabled}
      refreshable={refreshable}
      validate={validate}
      requiredMessage={requiredMessage}
      searchable={searchable}
      fetchItems={fetchProvincesAdapter}
      filterBy={provinceFilters && provinceFilters.length > 0 ? { country_ids: provinceFilters } : undefined}
    />
  );
};

export default ProvinceSelect;
