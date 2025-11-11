import React from "react";
import type { IRoleLevel } from "~/types/interfaces/IRoleLevelInterfaces";
import { fetchRoleLevels } from "~/services/roleLevelService";
import { CustomSelect } from "~/components/generic_components/CustomSelect";

interface RoleLevelSelectProps {
  value?: IRoleLevel | IRoleLevel[];
  multiple?: boolean;
  onChange: (payload: { data: IRoleLevel[]; valid: boolean }) => void; // 👈 always array
  label?: string;
  disabled?: boolean;
  refreshable?: boolean;
  validate?: boolean;
  roleLevelFilters?: number[];
  requiredMessage?: string;
  searchable?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
}

const RoleLevelSelect: React.FC<RoleLevelSelectProps> = ({
  value = [],
  multiple = false,
  onChange,
  label = "Role Level",
  disabled = false,
  refreshable = true,
  validate = false,
  roleLevelFilters,
  requiredMessage = "Role Level selection required.",
  searchable = false,
  icon = "Shield",
  iconPosition = "left",
}) => {
  const fetchRoleLevelsAdapter = async (filters?: Record<string, any>) => {
    const response = await fetchRoleLevels(filters);
    return response.data || [];
  };

  // Normalize value to array
  const normalizedValue = Array.isArray(value)
    ? value
    : value && Object.keys(value).length > 0
    ? [value]
    : [];

  // Adapter to always output array form
  const handleChange = (payload: { data: IRoleLevel | IRoleLevel[] | null; valid: boolean }) => {
    const normalizedData = Array.isArray(payload.data)
      ? payload.data
      : payload.data
      ? [payload.data]
      : [];
    onChange({ data: normalizedData, valid: payload.valid });
  };

  return (
    <CustomSelect<IRoleLevel>
      value={normalizedValue}
      multiple={multiple}
      onChange={handleChange}
      label={label}
      disabled={disabled}
      refreshable={refreshable}
      validate={validate}
      requiredMessage={requiredMessage}
      searchable={searchable}
      fetchItems={fetchRoleLevelsAdapter}
      filterBy={roleLevelFilters ? { roleLevelFilters } : undefined}
      iconName={icon}
      iconPosition={iconPosition}
    />
  );
};

export default RoleLevelSelect;
