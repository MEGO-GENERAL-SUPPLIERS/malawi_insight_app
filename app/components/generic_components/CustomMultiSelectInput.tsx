import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { RefreshCcw, PlusCircle, XCircle, AlertTriangle } from "lucide-react";

export interface MultiSelectItem<T> {
  option: T | null;
  contact: string;
}

export interface CustomMultiSelectInputProps<T> {
  label?: string;
  fetchMethod: () => Promise<T[]>;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
  onChange: (payload: { data: MultiSelectItem<T>[]; valid: boolean }) => void;
  validate?: boolean;
  liveValidation?: boolean;
  defaultValues?: MultiSelectItem<T>[];
  refreshable?: boolean;
  validationMessage?: string;
  showErrorMessage?: boolean;
  /** Optional custom validator for each row: return true if valid */
  validateValue?: (option: T | null, value: string) => boolean;
  /** Optional maximum number of rows user can add */
  maxItems?: number;
  showEmptyRowOnClear?: boolean;
}

function CustomMultiSelectInput<T>({
  label = "Select Items",
  fetchMethod,
  getOptionLabel,
  getOptionValue,
  onChange,
  validate = true,
  liveValidation = true,
  defaultValues = [],
  refreshable = true,
  validationMessage = "Please fill all fields",
  showErrorMessage = true,
  validateValue,
  maxItems = Infinity,
  showEmptyRowOnClear = false
}: CustomMultiSelectInputProps<T>) {
  const [options, setOptions] = useState<T[]>([]);
  const [items, setItems] = useState<MultiSelectItem<T>[]>(
    defaultValues.length ? defaultValues : showEmptyRowOnClear ? [{ option: null, contact: "" }] : []
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<boolean[]>([]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const data = await fetchMethod();
      setOptions(data);
    } catch (err) {
      console.error("Failed to fetch options:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  // Emit data + valid
  const emitChange = (updatedItems: MultiSelectItem<T>[]) => {
    const isValid =
      !validate ||
      updatedItems.every((item) =>
        validateValue
          ? validateValue(item.option, item.contact)
          : !!item.option && item.contact.trim() !== ""
      );
    onChange({ data: updatedItems, valid: isValid });
  };

  const handleAdd = () => {
    if (items.length >= maxItems) return; // prevent adding beyond max
    const updated = [...items, { option: null, contact: "" }];
    setItems(updated);
    if (validate && liveValidation) validateFields(updated);
    emitChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    if (validate && liveValidation) validateFields(updated);
    emitChange(updated);
  };

  const handleChange = (
    index: number,
    field: "option" | "contact",
    newValue: any
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: newValue };
    setItems(updated);

    if (validate && liveValidation) validateFields(updated);
    emitChange(updated);
  };

  const validateFields = (data: MultiSelectItem<T>[]) => {
    const results = data.map((item) =>
      validateValue
        ? validateValue(item.option, item.contact)
        : !!item.option && item.contact.trim() !== ""
    );
    setErrors(results);
  };

  const handleClearAll = () => {
    setItems([]);
    setErrors([]);
    emitChange([]);
  };

  return (
    <Box className="p-2 border border-slate-300 rounded-lg shadow-sm bg-white">
      <Box className="flex justify-between items-center mb-2">
        <Typography variant="subtitle1" className="font-semibold">
          {label}
        </Typography>

        <Box className="flex items-center gap-2">
          {refreshable && (
            <Tooltip title="Refresh options">
              <IconButton size="small" onClick={loadOptions}>
                {loading ? <CircularProgress size={16} /> : <RefreshCcw size={16} />}
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Clear all">
            <IconButton size="small" color="error" onClick={handleClearAll}>
              <XCircle size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {items.map((item, index) => {
        const hasError = validate && !errors[index];

        return (
          <div
            key={index}
            className="flex flex-col gap-1 mb-2 animate-fade-in"
          >
            <Box className="flex items-center gap-2">
              <FormControl size="small" className="w-1/3">
                <Select
                  value={item.option ? getOptionValue(item.option) : ""}
                  displayEmpty
                  onChange={(e) => {
                    const selected = options.find(
                      (opt) => getOptionValue(opt) === e.target.value
                    );
                    handleChange(index, "option", selected || null);
                  }}
                >
                  <MenuItem value="">
                    <em>Select option</em>
                  </MenuItem>
                  {options.map((opt) => (
                    <MenuItem
                      key={getOptionValue(opt)}
                      value={getOptionValue(opt)}
                    >
                      {getOptionLabel(opt)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder="Enter value"
                className="flex-1"
                value={item.contact}
                onChange={(e) => handleChange(index, "contact", e.target.value)}
                error={hasError}
                slotProps={{
                  input: {
                    endAdornment: hasError ? (
                      <InputAdornment position="end">
                        <AlertTriangle size={16} color="red" />
                      </InputAdornment>
                    ) : null
                  }
                }}
              />

              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemove(index)}
              >
                &times;
              </IconButton>
            </Box>

            {showErrorMessage && hasError && (
              <Typography
                variant="caption"
                color="error"
                className="text-right"
              >
                {validationMessage}
              </Typography>
            )}
          </div>
        );
      })}

      <Box className="flex justify-start mt-2">
        <Tooltip title="Add new field set">
          <button
            type="button"
            disabled={items.length >= maxItems}
            className={`px-2 py-1 btn btn-success flex items-center gap-1 ${items.length >= maxItems ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleAdd}
          >
            <PlusCircle size={15} /> Add
          </button>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default CustomMultiSelectInput;