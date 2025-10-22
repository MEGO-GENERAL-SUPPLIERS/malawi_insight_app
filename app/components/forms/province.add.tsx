import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { TextField, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

interface ProvinceFormProps {
  initialData?: {
    country_id: number;
    name: string;
    code: string;
  };
}

interface ProvinceFormHandle {
  getFormData: () => { country_id: number; name: string; code: string };
  resetForm: () => void;
  setFormData: (data: { country_id: number; name: string; code: string }) => void;
}

const ProvinceAddForm = forwardRef<ProvinceFormHandle, ProvinceFormProps>(
  ({ initialData }, ref) => {
    const [formData, setFormDataState] = useState({
      country_id: 1,
      name: "",
      code: "",
    });

    // If initialData changes, update the form automatically (edit mode)
    useEffect(() => {
      if (initialData) {
        setFormDataState(initialData);
      }
    }, [initialData]);

    const handleTextChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setFormDataState((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
      const { name, value } = e.target;
      const newValue = isNaN(Number(value)) ? value : Number(value);
      setFormDataState((prev) => ({ ...prev, [name]: newValue }));
    };

    useImperativeHandle(ref, () => ({
      getFormData: () => formData,
      resetForm: () =>
        setFormDataState({
          country_id: 1,
          name: "",
          code: "",
        }),
      setFormData: (data: { country_id: number; name: string; code: string }) =>
        setFormDataState(data),
    }));

    return (
      <form autoComplete="off">
        <div className="flex flex-col gap-6">
          <Select
            label="Country"
            name="country_id"
            size="small"
            fullWidth
            value={formData.country_id}
            onChange={handleSelectChange}
            displayEmpty
          >
            <MenuItem value="">
              <em>Select Country</em>
            </MenuItem>
            <MenuItem value={1}>Malawi</MenuItem>
          </Select>

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
