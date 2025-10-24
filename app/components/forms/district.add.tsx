import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { TextField, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { fetchDistrictProvinces } from "~/services/districtService";
import type { IDistrict } from "~/types/interfaces/IDistrictInterdaces";

interface DistrictFormProps {
  initialData?: {
    id: number;
    province_id: number;
    name: string;
    code: string;
  };
  setSlotData?: (data: any) => void;
}

export interface DistrictFormHandle {
  getFormData: () => { id: number; province_id: number; name: string; code: string };
  resetForm: () => void;
  setFormData: (data: { id: number; province_id: number; name: string; code: string }) => void;
}

const DistrictAddForm = forwardRef<DistrictFormHandle, DistrictFormProps>(({ initialData, setSlotData }, ref) => {
  const [formData, setFormDataState] = useState<{
    id: number; 
    province_id: number;
    name: string;
    code: string;
  }>({
    id: 0,
    province_id: 0,
    name: "",
    code: "",
  });
  const [provinces, setProvinces] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    if (initialData) setFormDataState(initialData);

    const loadProvinces = async () => {
      const data = await fetchDistrictProvinces();
      setProvinces(data);
    };
    loadProvinces();
  }, [initialData]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  useImperativeHandle(ref, () => ({
    getFormData: () => formData,
    resetForm: () => setFormDataState({ id: 0, province_id: 1, name: "", code: "" }),
    setFormData: (data) => setFormDataState(data),
  }));

  return (
    <form autoComplete="off">
      <div className="flex flex-col gap-6">
        <Select
          label="Province"
          name="province_id"
          size="small"
          fullWidth
          value={formData.province_id}
          onChange={handleSelectChange}
        >
          <MenuItem value="">
            <em>Select Province</em>
          </MenuItem>
          {provinces.map((p) => (
            <MenuItem key={p.value} value={p.value}>
              {p.label}
            </MenuItem>
          ))}
        </Select>

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
});

export default DistrictAddForm;
