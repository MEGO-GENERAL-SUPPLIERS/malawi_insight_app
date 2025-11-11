import React, { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Box,
  Typography,
  TextField,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import * as LucideIcons from "lucide-react";
import * as MuiIcons from "@mui/icons-material";
import { type IconType } from "react-icons";

export interface CustomSelectProps<T extends { id: number }> {
  value?: T | T[]; // 🟢 can be single or multiple
  multiple?: boolean;
  label?: string;
  disabled?: boolean;
  refreshable?: boolean;
  validate?: boolean;
  requiredMessage?: string;
  searchable?: boolean;
  fetchItems: (filters?: Record<string, any>) => Promise<T[]>;
  filterBy?: Record<string, any[]>;
  onChange: (payload: { data: T | T[] | null; valid: boolean }) => void; // 🟢 emits single or array
  getOptionLabel?: (option: T) => string;

  iconName?: string;
  iconLibrary?: "lucide" | "mui" | "react";
  iconPosition?: "left" | "right";
  onIconClick?: () => void;
}

export function CustomSelect<T extends { id: number }>({
  value,
  multiple = false,
  onChange,
  label = "Select",
  disabled = false,
  refreshable = true,
  validate = false,
  requiredMessage = "Selection required.",
  searchable = false,
  fetchItems,
  filterBy,
  iconName,
  iconLibrary = "lucide",
  iconPosition = "right",
  onIconClick,
}: CustomSelectProps<T>) {
  const labelId = React.useId();
  const [items, setItems] = useState<T[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean>(!validate);
  const [touched, setTouched] = useState(false);

  // Preselect items
  useEffect(() => {
    if (value) {
      const values = Array.isArray(value) ? value : [value];
      setSelected(values.map((v) => v.id));
      if (validate) setValid(true);
    }
  }, [value]);

  // Load items when filters change
  useEffect(() => {
    loadItems();
  }, [filterBy]);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchItems(filterBy);
      setItems(response || []);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || `Failed to load ${label}s.`;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // 🧠 handle both single and multiple emissions
  const emitSelection = (selectedItems: T[]) => {
    const isValid = !validate || selectedItems.length > 0;
    setValid(isValid);
    const data = multiple ? selectedItems : selectedItems[0] || null;
    onChange({ data, valid: isValid });
  };

  // --- 🧩 Resolve Icon Dynamically ---
  const renderIcon = () => {
    if (!iconName) return null;
    let IconComponent: any = null;

    switch (iconLibrary) {
      case "lucide":
        IconComponent = (LucideIcons as any)[iconName];
        break;
      case "mui":
        IconComponent = (MuiIcons as any)[iconName];
        break;
      case "react":
        IconComponent = (MuiIcons as Record<string, IconType>)[iconName];
        break;
      default:
        return null;
    }

    const position = iconPosition === "left" ? "start" : "end";
    if (!IconComponent) return null;

    return (
      <InputAdornment position={position}>
        <IconButton edge={position} onClick={onIconClick}>
          <IconComponent size={15} />
        </IconButton>
      </InputAdornment>
    );
  };

  const handleSelectChange = (e: any) => {
    setTouched(true);
    const selectedId = e.target.value;
    setSelected(selectedId ? [selectedId] : []);
    const selectedItems = items.filter((i) => i.id === selectedId);
    emitSelection(selectedItems);
  };

  const handleAutoCompleteChange = (
    _: React.SyntheticEvent<Element, Event>,
    valueFromAutoComplete: T[] | T | null
  ) => {
    setTouched(true);
    const selectedItems = Array.isArray(valueFromAutoComplete)
      ? valueFromAutoComplete
      : valueFromAutoComplete
      ? [valueFromAutoComplete]
      : [];
    setSelected(selectedItems.map((i) => i.id));
    emitSelection(selectedItems);
  };

  // Shared InputProps for TextField in Autocomplete
  const getInputProps = (params: any) => ({
    ...params.InputProps,
    startAdornment:
      iconPosition === "left" ? renderIcon() : params.InputProps.startAdornment,
    endAdornment: (
      <>
        {iconPosition === "right" && renderIcon()}
        {params.InputProps.endAdornment}
        {refreshable && !loading && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={loadItems}>
              <Refresh fontSize="small" />
            </IconButton>
          </InputAdornment>
        )}
        {loading && <CircularProgress size={15} sx={{ ml: 0.5 }} />}
      </>
    ),
  });

  return (
    <Box position="relative" width="100%">
      <FormControl
        size="small"
        fullWidth
        disabled={disabled}
        error={validate && touched && !valid}
      >
        {/* Only render InputLabel for single Select */}
        {!(multiple || searchable) && <InputLabel id={labelId}>{label}</InputLabel>}

        {multiple || searchable ? (
          <Autocomplete
            multiple={multiple}
            options={items}
            getOptionLabel={(option) => (option as any).name || String(option.id)}
            value={items.filter((i) => selected.includes(i.id))}
            onChange={handleAutoCompleteChange}
            disableCloseOnSelect={multiple}
            disabled={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label={label}
                onBlur={() => setTouched(true)}
                InputProps={getInputProps(params)}
              />
            )}
          />
        ) : (
          <Box display="flex" alignItems="center">
            <Select
              labelId={labelId}
              id={`${labelId}-select`}
              value={selected[0] || ""}
              onChange={handleSelectChange}
              onBlur={() => setTouched(true)}
              disabled={loading}
              fullWidth
            >
              <MenuItem value="">
                <em>Select {label}</em>
              </MenuItem>
              {items.map((i) => (
                <MenuItem key={i.id} value={i.id}>
                  {(i as any).name || i.id}
                </MenuItem>
              ))}
            </Select>

            {/* Refresh & loading for single select */}
            {refreshable && !loading && (
              <IconButton size="small" onClick={loadItems} sx={{ ml: 1 }}>
                <Refresh fontSize="small" />
              </IconButton>
            )}
            {loading && <CircularProgress size={15} sx={{ ml: 1 }} />}
          </Box>
        )}
      </FormControl>

      {/* Footer */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mt={0.5} minHeight="20px">
        {error && (
          <Typography variant="caption" color="error" fontSize={13}>
            {error}
          </Typography>
        )}
        {!error && validate && touched && !valid && (
          <Typography variant="caption" color="error" fontSize={13}>
            {requiredMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default CustomSelect;
