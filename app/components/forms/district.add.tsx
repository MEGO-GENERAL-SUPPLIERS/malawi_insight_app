import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { TextField, Select, MenuItem, CircularProgress, Box, InputLabel, FormControl } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { fetchCountries } from "~/services/countryService";
import { fetchDistrictProvinces } from "~/services/districtService";
// import type { IDistrict } from "~/types/interfaces/IDistrictInterfaces";
import type { ICountry } from "~/types/interfaces/ICountryInterfaces";

interface DistrictFormProps {
  initialData?: {
    id: number;
    country_id?: number;
    province_id: number;
    name: string;
    code: string;
  };
  setSlotData?: (data: any) => void;
}

export interface DistrictFormHandle {
  getFormData: () => { id: number; country_id?: number; province_id: number; name: string; code: string };
  resetForm: () => void;
  setFormData: (data: { id: number; country_id?: number; province_id: number; name: string; code: string }) => void;
}

const DistrictAddForm = forwardRef<DistrictFormHandle, DistrictFormProps>(
  ({ initialData, setSlotData }, ref) => {
    const [formData, setFormDataState] = useState<{
      id: number;
      country_id?: number; // optional number
      province_id: number;
      name: string;
      code: string;
    }>({
      id: 0,
      country_id: undefined,
      province_id: 0,
      name: "",
      code: "",
    });

    const [countries, setCountries] = useState<ICountry[]>([]);
    const [provinces, setProvinces] = useState<{ label: string; value: number }[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [loadingProvinces, setLoadingProvinces] = useState(false);

    // Load countries initially
    useEffect(() => {
      const loadCountries = async () => {
        setLoadingCountries(true);
        try {
          const data = await fetchCountries();
          setCountries(data);
        } catch (err) {
          console.error("Failed to fetch countries:", err);
          setCountries([]);
        } finally {
          setLoadingCountries(false);
        }
      };
      loadCountries();
    }, []);

    // Load initial data if editing
    useEffect(() => {
      if (initialData) {
        setFormDataState(initialData);

        if (initialData.country_id) {
          handleCountryChange(initialData.country_id, initialData.province_id);
        }
      }
    }, [initialData]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const newData = { ...formData, [name]: value };
      setFormDataState(newData);
      setSlotData?.(newData);
    };

    const handleCountryChange = async (countryId: number, selectedProvinceId?: number) => {
      setFormDataState((prev): any => ({ ...prev, country_id: countryId, province_id: 0 }));
      setProvinces([]);
      setLoadingProvinces(true);

      try {
        if (countryId) {
          const data = await fetchDistrictProvinces({ country_id: countryId });
          const mappedProvinces = data.map(p => ({ label: p.label, value: p.value }));
          setProvinces(mappedProvinces);

          if (selectedProvinceId) {
            setFormDataState(prev => ({ ...prev, province_id: selectedProvinceId }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch provinces:", err);
        setProvinces([]);
      } finally {
        setLoadingProvinces(false);
      }
    };

    const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
      const { name, value } = e.target;
      const newValue = isNaN(Number(value)) ? value : Number(value);
      const newData = { ...formData, [name]: newValue };
      setFormDataState(newData);
      setSlotData?.(newData);

      if (name === "country_id") handleCountryChange(Number(newValue));
    };

    useImperativeHandle(ref, () => ({
      getFormData: () => formData,
      resetForm: () =>
        setFormDataState({ id: 0, country_id: undefined, province_id: 0, name: "", code: "" }),
      setFormData: (data) => setFormDataState(data),
    }));

    return (
      <form autoComplete="off">
        <div className="flex flex-col gap-8">
          {/* Country dropdown */}
          <FormControl size="small" fullWidth>
            <InputLabel>Country</InputLabel>
            <Select
              label="Country"
              name="country_id"
              value={formData.country_id || ""}
              onChange={handleSelectChange}
              disabled={loadingCountries}
            >
              <MenuItem value="">
                <em>{loadingCountries ? "Loading..." : "Select Country"}</em>
              </MenuItem>
              {countries.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Province dropdown */}
          <FormControl size="small" fullWidth>
            <InputLabel>Province</InputLabel>
            <Select
              label="Province"
              name="province_id"
              value={formData.province_id || ""}
              onChange={handleSelectChange}
              disabled={provinces.length === 0}
            >
              <MenuItem value="">
                <em>{provinces.length === 0 ? "Select Country First" : "Select Province"}</em>
              </MenuItem>
              {provinces.map(p => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </Select>
            {loadingProvinces && (
              <Box className="absolute right-2 top-[35px] ">
                <CircularProgress size={14} /> 
                <span className="text-xs">{"loading provinces..."}</span>
              </Box>
            )}
          </FormControl>

          <TextField
            label="District Name"
            name="name"
            variant="outlined"
            size="small"
            fullWidth
            value={formData.name}
            onChange={handleTextChange}
          />

          <TextField
            label="District Code"
            name="code"
            variant="outlined"
            size="small"
            fullWidth
            value={formData.code}
            onChange={handleTextChange}
          />
        </div>
      </form>
    );
  }
);

export default DistrictAddForm;
