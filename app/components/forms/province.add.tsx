import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { TextField, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

interface ProvinceFormProps {
  initialData?: {
    country_id: number;
    name: string;
    code: string;
  };
  // ✅ Added so ModalComponent can inject safely
  setSlotData?: (data: any) => void;
}

export interface ProvinceFormHandle {
  getFormData: () => { country_id: number; name: string; code: string };
  resetForm: () => void;
  setFormData: (data: { country_id: number; name: string; code: string }) => void;
}

const ProvinceAddForm = forwardRef<ProvinceFormHandle, ProvinceFormProps>(
  ({ initialData, setSlotData }, ref) => {
    const [formData, setFormDataState] = useState({
      country_id: 1,
      name: "",
      code: "",
    });

    // 🔹 Auto-update form when editing existing record
    useEffect(() => {
      if (initialData) {
        setFormDataState(initialData);
      }
    }, [initialData]);

    const handleTextChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      const newData = { ...formData, [name]: value };
      setFormDataState(newData);
      setSlotData?.(newData); // update slot data in parent
    };

    const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
      const { name, value } = e.target;
      const newValue = isNaN(Number(value)) ? value : Number(value);
      const newData = { ...formData, [name]: newValue };
      setFormDataState(newData);
      setSlotData?.(newData);
    };

    // 🔹 Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      getFormData: () => formData,
      resetForm: () =>
        setFormDataState({
          country_id: 1,
          name: "",
          code: "",
        }),
      setFormData: (data) => setFormDataState(data),
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
