import React from "react";
import type { ICountry } from "~/types/interfaces/ICountryInterfaces";
import { fetchCountries } from "~/services/countryService";
import{ CustomSelect } from "~/components/generic_components/CustomSelect";

interface CountrySelectProps {
  value?: ICountry[];
  multiple?: boolean;
  onChange: (payload: { data: ICountry[]; valid: boolean }) => void;
  label?: string;
  disabled?: boolean;
  refreshable?: boolean;
  validate?: boolean;
  countryFilters?: number[]; // e.g. continents[1, 2]
  requiredMessage?: string;
  searchable?: boolean; // optional, for enabling search
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value = [],
  multiple = false,
  onChange,
  label = "Country",
  disabled = false,
  refreshable = true,
  validate = false,
  countryFilters,
  requiredMessage = "Country selection required.",
  searchable = false,
}) => {

  const handleChange = (payload: { data: ICountry | ICountry[] | null; valid: boolean }) => {
    let normalizedData: ICountry[] = [];
    if (Array.isArray(payload.data)) normalizedData = payload.data;
    else if (payload.data) normalizedData = [payload.data];
    // else keep empty array if null
    onChange({ data: normalizedData, valid: payload.valid });
  };

  
  return (
    <CustomSelect<ICountry>
      value={value}
      multiple={multiple}
      onChange={handleChange}
      label={label}
      disabled={disabled}
      refreshable={refreshable}
      validate={validate}
      requiredMessage={requiredMessage}
      searchable={searchable}
      fetchItems={fetchCountries}
      filterBy={countryFilters ? { countryFilters } : undefined}
    />
  );
};

export default CountrySelect;
