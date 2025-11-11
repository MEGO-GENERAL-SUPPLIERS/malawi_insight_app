import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  InputLabel,
  FormControl,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { fetchCountries } from "~/services/countryService";
import { fetchProvinces } from "~/services/provinceService";
import type { ICountry } from "~/types/interfaces/ICountryInterfaces";
import type { IProvince } from "~/types/interfaces/IProvinceInterfaces";

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
  getFormData: () => {
    id: number;
    country_id?: number;
    province_id: number;
    name: string;
    code: string;
  };
  resetForm: () => void;
  setFormData: (data: {
    id: number;
    country_id?: number;
    province_id: number;
    name: string;
    code: string;
  }) => void;
}

const DistrictAddForm = forwardRef<DistrictFormHandle, DistrictFormProps>(
  ({ initialData, setSlotData }, ref) => {
    const [formData, setFormDataState] = useState<{
      id: number;
      country_id?: number | undefined;
      province_id: number; 
      name: string; 
      code: string;
    }>({
      id: 0,
      country_id: undefined as number | undefined,
      province_id: 0,
      name: "",
      code: "",
    });

    const [countries, setCountries] = useState<ICountry[]>([]);
    const [provinces, setProvinces] = useState<IProvince[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [loadingProvinces, setLoadingProvinces] = useState(false);

    // 🟢 Load countries initially
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

    // 🟢 If editing, preload form + load provinces
    useEffect(() => {
      if (initialData) {
        setFormDataState(initialData);

        if (initialData.country_id) {
          loadProvinces(initialData.country_id, initialData.province_id);
        }
      }
    }, [initialData]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const newData = { ...formData, [name]: value };
      setFormDataState(newData);
      setSlotData?.(newData);
    };

    // 🟢 Load provinces for the selected country
   const loadProvinces = async (countryId: number, selectedProvinceId?: number) => {
      if (!countryId) return;
      try {
        const res = await fetchProvinces({ countries: [countryId] });
        if (res?.success && Array.isArray(res.data)) {
          setProvinces(res.data);
          if (selectedProvinceId) {
            setFormDataState((prev) => ({ ...prev, province_id: selectedProvinceId }));
          }
        } else {
          setProvinces([]);
        }
      } catch (err) {
        console.error("Failed to fetch provinces:", err);
        setProvinces([]);
      } finally {
        // ✅ Only re-enable after completion
        setLoadingProvinces(false);
      }
    };

    // 🟢 Handle Select changes (country & province)
    const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
      const { name, value } = e.target;
      const newValue = Number(value) || 0;

      const updatedForm = { ...formData, [name]: newValue };
      setFormDataState(updatedForm);
      setSlotData?.(updatedForm);

      if (name === "country_id") {
        // 🟡 Disable provinces while loading new ones
        setProvinces([]);
        setLoadingProvinces(true);
        setFormDataState((prev) => ({ ...prev, province_id: 0 }));

        // Always pass array for API compatibility
        loadProvinces(newValue);
      }
    };

    // 🟢 Expose form methods to parent
    useImperativeHandle(ref, () => ({
      getFormData: () => formData,
      resetForm: () =>
        setFormDataState({
          id: 0,
          country_id: undefined,
          province_id: 0,
          name: "",
          code: "",
        }),
      setFormData: (data) => {
        setFormDataState(data);
        if (data.country_id) loadProvinces(data.country_id, data.province_id);
      },
    }));

    return (
      <form autoComplete="off">
        <div className="flex flex-col gap-8">
          {/* 🌍 Country dropdown */}
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
              {countries.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 🏞 Province dropdown */}
          <FormControl size="small" fullWidth disabled={loadingProvinces}>
            <InputLabel>Province</InputLabel>
            <Select
              label="Province"
              name="province_id"
              value={formData.province_id || ""}
              onChange={handleSelectChange}
              disabled={loadingProvinces || !provinces.length}
            >
              <MenuItem value="">
                <em>
                  {loadingProvinces
                    ? "Loading Provinces..."
                    : !formData.country_id
                    ? "Select Country First"
                    : "Select Province"}
                </em>
              </MenuItem>
              {provinces.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
            {loadingProvinces && (
              <Box className="absolute right-2 top-[35px] flex items-center gap-1">
                <CircularProgress size={14} />
                <span className="text-xs text-gray-500">Loading...</span>
              </Box>
            )}
          </FormControl>

          {/* 🏘 District Name */}
          <TextField
            label="District Name"
            name="name"
            variant="outlined"
            size="small"
            fullWidth
            value={formData.name}
            onChange={handleTextChange}
          />

          {/* 🆔 District Code */}
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
