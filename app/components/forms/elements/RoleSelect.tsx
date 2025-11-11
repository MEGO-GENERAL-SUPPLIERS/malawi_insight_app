import React from "react";
import type { IRole } from "~/types/interfaces/IRoleInterfaces";
import { fetchRoles } from "~/services/roleService";
import { CustomSelect } from "~/components/generic_components/CustomSelect";

interface RoleSelectProps {
  value?: IRole[];
  multiple?: boolean;
  onChange: (payload: { data: IRole[]; valid: boolean }) => void;
  label?: string;
  disabled?: boolean;
  refreshable?: boolean;
  validate?: boolean;
  roleFilters?: number[]; // filter key e.d role_level: [1,3]
  requiredMessage?: string;
  searchable?: boolean;
}

const RoleSelect: React.FC<RoleSelectProps> = ({
  value = [],
  multiple = false,
  onChange,
  label = "Role",
  disabled = false,
  refreshable = true,
  validate = false,
  roleFilters,
  requiredMessage = "Role selection required.",
  searchable = false,
}) => {
  
  const fetchRolesAdapter = async (filters?: Record<string, any>) => {
    const response = await fetchRoles(filters);
    return response.data || []; 
  };

  const handleChange = (payload: { data: IRole | IRole[] | null; valid: boolean }) => {
      const data = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];
      onChange({ data, valid: payload.valid });
    };

  return (
    <CustomSelect<IRole>
      value={value}
      multiple={multiple}
      onChange={handleChange}
      label={label}
      disabled={disabled}
      refreshable={refreshable}
      validate={validate}
      requiredMessage={requiredMessage}
      searchable={searchable}
      fetchItems={fetchRolesAdapter}
      filterBy={roleFilters && roleFilters.length > 0 ? { role_level_ids: roleFilters } : undefined}
    />
  );
};

export default RoleSelect;

