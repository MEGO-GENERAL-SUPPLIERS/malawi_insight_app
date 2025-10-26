import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { TextField, Select, MenuItem, CircularProgress, Box } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { fetchCountries } from "~/services/countryService";
import type { ICountry } from "~/types/interfaces/ICountryInterfaces";

interface ProvinceFormProps {
  initialData?: {
    id: number;
    country_id: number;
    name: string;
    code: string;
  };
  setSlotData?: (data: any) => void;
}

export interface ProvinceFormHandle {
  getFormData: () => { id: number; country_id: number; name: string; code: string };
  resetForm: () => void;
  setFormData: (data: { id: number; country_id: number; name: string; code: string }) => void;
}

const ProvinceAddForm = forwardRef<ProvinceFormHandle, ProvinceFormProps>(
  ({ initialData, setSlotData }, ref) => {
    const [formData, setFormDataState] = useState({
      id: 0,
      country_id: 0,
      name: "",
      code: "",
    });

    const [countries, setCountries] = useState<{ label: string; value: number }[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(true);

    // Load countries on mount
    useEffect(() => {
      const loadCountries = async () => {
        setLoadingCountries(true);
        try {
          const result: ICountry[] = await fetchCountries();
          setCountries(result.map(c => ({ label: c.name, value: c.id })));
        } catch (err) {
          console.error("Failed to fetch countries:", err);
          setCountries([]);
        } finally {
          setLoadingCountries(false);
        }
      };

      loadCountries();
    }, []);

    // Auto-update form when editing existing record
    useEffect(() => {
      if (initialData) setFormDataState(initialData);
    }, [initialData]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const newData = { ...formData, [name]: value };
      setFormDataState(newData);
      setSlotData?.(newData);
    };

    const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
      const { name, value } = e.target;
      const newValue = isNaN(Number(value)) ? value : Number(value);
      const newData = { ...formData, [name]: newValue };
      setFormDataState(newData);
      setSlotData?.(newData);
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      getFormData: () => formData,
      resetForm: () =>
        setFormDataState({ id: 0, country_id: 0, name: "", code: "" }),
      setFormData: (data) => setFormDataState(data),
    }));

    return (
      <form autoComplete="off">
        <div className="flex flex-col gap-8">
          {loadingCountries ? (
            <Box className="flex justify-center py-4">
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Select
              label="Country"
              name="country_id"
              size="small"
              fullWidth
              value={formData.country_id}
              onChange={handleSelectChange}
              displayEmpty
            >
              <MenuItem value={0}>
                <em>Select Country</em>
              </MenuItem>
              {countries.map(c => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          )}

          <TextField
            label="Province Name"
            name="name"
            variant="outlined"
            size="small"
            value={formData.name}
            fullWidth
            onChange={handleTextChange}
          />

          <TextField
            label="Province Code"
            name="code"
            variant="outlined"
            size="small"
            value={formData.code}
            fullWidth
            onChange={handleTextChange}
          />
        </div>
      </form>
    );
  }
);

export default ProvinceAddForm;
