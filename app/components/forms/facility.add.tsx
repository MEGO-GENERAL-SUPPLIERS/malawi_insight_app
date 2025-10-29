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
import { fetchDistricts } from "~/services/districtService";
import type { ICountry } from "~/types/interfaces/ICountryInterfaces";
import type { IProvince } from "~/types/interfaces/IProvinceInterfaces";
import type { IDistrict } from "~/types/interfaces/IDistrictInterfaces";
import type { IApiResponse } from "~/types/interfaces/IApiResponse";

interface FacilityFormProps {
  initialData?: {
    id: number;
    country_id?: number;
    province_id?: number;
    district_id: number;
    name: string;
    code: string;
  };
  setSlotData?: (data: any) => void;
}

export interface DistrictFormHandle {
  getFormData: () => {
    id: number;
    country_id?: number;
    province_id?: number;
    district_id: number;
    name: string;
    code: string;
  };
  resetForm: () => void;
  setFormData: (data: {
    id: number;
    country_id?: number;
    province_id?: number;
    district_id: number;
    name: string;
    code: string;
  }) => void;
}

const FacilityAddForm = forwardRef<DistrictFormHandle, FacilityFormProps>(
  ({ initialData, setSlotData }, ref) => {
    const [formData, setFormDataState] = useState({
      id: 0,
      country_id: undefined as number | undefined,
      province_id: undefined as number | undefined,
      district_id: 0,
      name: "",
      code: "",
    });

    const [countries, setCountries] = useState<ICountry[]>([]);
    const [provinces, setProvinces] = useState<{ label: string; value: number }[]>([]);
    const [districts, setDistricts] = useState<{ label: string; value: number }[]>([]);

    const [loadingCountries, setLoadingCountries] = useState(true);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    // ✅ Load countries initially
    useEffect(() => {
      const loadCountries = async () => {
        setLoadingCountries(true);
        try {
          const response: ICountry[] = await fetchCountries();
          setCountries(response ?? []);
        } catch (err) {
          console.error("Failed to fetch countries:", err);
          setCountries([]);
        } finally {
          setLoadingCountries(false);
        }
      };
      loadCountries();
    }, []);

    // ✅ Load provinces when country is selected
    const handleCountryChange = async (countryId: number, selectedProvinceId?: number) => {
      setFormDataState((prev) => ({ ...prev, country_id: countryId, province_id: undefined }));
      setProvinces([]);
      setDistricts([]);
      setLoadingProvinces(true);

      try {
        const response: IApiResponse<IProvince[]> = await fetchProvinces({ country_id: countryId });
        const mappedProvinces = (response.data ?? []).map((p) => ({
          label: p.name,
          value: p.id,
        }));
        setProvinces(mappedProvinces);

        if (selectedProvinceId) {
          setFormDataState((prev) => ({ ...prev, province_id: selectedProvinceId }));
          await handleProvinceChange(selectedProvinceId);
        }
      } catch (err) {
        console.error("Failed to fetch provinces:", err);
      } finally {
        setLoadingProvinces(false);
      }
    };

    // ✅ Load districts when province is selected
    const handleProvinceChange = async (provinceId: number, selectedDistrictId?: number) => {
      setFormDataState((prev) => ({ ...prev, province_id: provinceId, district_id: 0 }));
      setDistricts([]);
      setLoadingDistricts(true);

      try {
        const response: IApiResponse<IDistrict[]> = await fetchDistricts({
          province_id: provinceId,
        });
        const mappedDistricts = (response.data ?? []).map((d) => ({
          label: d.name,
          value: d.id,
        }));
        setDistricts(mappedDistricts);

        if (selectedDistrictId) {
          setFormDataState((prev) => ({ ...prev, district_id: selectedDistrictId }));
        }
      } catch (err) {
        console.error("Failed to fetch districts:", err);
      } finally {
        setLoadingDistricts(false);
      }
    };

    // ✅ Handle initial edit mode data
    useEffect(() => {
      if (initialData) {
        setFormDataState((prev) => ({ ...prev, ...initialData }));
        if (initialData.country_id) {
          handleCountryChange(initialData.country_id, initialData.province_id)
          .then(() => {
            if(initialData.district_id){
              setFormDataState((prev) => (
                {...prev, district_id: initialData.district_id }
              ));
            }
          });
        }
      }
    }, [initialData]);

    // ✅ Handle text inputs
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const newData = { ...formData, [name]: value };
      setFormDataState(newData);
      setSlotData?.(newData);
    };

    // ✅ Handle dropdown selections
    const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
      const { name, value } = e.target;
      const newValue = isNaN(Number(value)) ? value : Number(value);
      const newData = { ...formData, [name]: newValue };
      setFormDataState(newData);
      setSlotData?.(newData);

      if (name === "country_id") handleCountryChange(Number(newValue));
      if (name === "province_id") handleProvinceChange(Number(newValue));
    };

    // ✅ Expose methods via ref
    useImperativeHandle(ref, () => ({
      getFormData: () => formData,
      resetForm: () =>
        setFormDataState({
          id: 0,
          country_id: undefined,
          province_id: undefined,
          district_id: 0,
          name: "",
          code: "",
        }),
      setFormData: (data) => setFormDataState((prev) => ({ ...prev, ...data })),
    }));

    // ✅ Render form
    return (
      <form autoComplete="off">
        <div className="flex flex-col gap-8">
          {/* Country */}
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

          {/* Province */}
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
                <em>{loadingProvinces ? "Loading..." : "Select Province"}</em>
              </MenuItem>
              {provinces.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </Select>
            {loadingProvinces && (
              <Box className="absolute right-2 top-[35px]">
                <CircularProgress size={14} />
                <span className="text-xs">{"loading provinces..."}</span>
              </Box>
            )}
          </FormControl>

          {/* District */}
          <FormControl size="small" fullWidth>
            <InputLabel>District</InputLabel>
            <Select
              label="District"
              name="district_id"
              value={formData.district_id || ""}
              onChange={handleSelectChange}
              disabled={districts.length === 0}
            >
              <MenuItem value="">
                <em>{loadingDistricts ? "Loading..." : "Select District"}</em>
              </MenuItem>
              {districts.map((d) => (
                <MenuItem key={d.value} value={d.value}>
                  {d.label}
                </MenuItem>
              ))}
            </Select>
            {loadingDistricts && (
              <Box className="absolute right-2 top-[35px]">
                <CircularProgress size={14} />
                <span className="text-xs">{"loading districts..."}</span>
              </Box>
            )}
          </FormControl>

          <TextField
            label="Facility Name"
            name="name"
            variant="outlined"
            size="small"
            fullWidth
            value={formData.name}
            onChange={handleTextChange}
          />

          <TextField
            label="Facility Code"
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

export default FacilityAddForm;
