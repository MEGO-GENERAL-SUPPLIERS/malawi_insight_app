import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";

export interface CustomRadioProps<T> {
  options: T[] | null;
  value?: T | null;
  label?: string;
  validate?: boolean;
  validationMessage?: string;
  onChange: (payload: { value: T | null; valid: boolean }) => void;
  direction?: "row" | "column";
  radioLabelPosition?: "left" | "right" | "top" | "bottom";
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => string | number;
  disabled?: boolean;
  refreshable?: boolean;
  onRefresh?: () => Promise<T[] | null>;
}

export const CustomRadio = <T,>({
  options,
  value,
  label,
  validate = false,
  validationMessage = "Selection required",
  onChange,
  direction = "row",
  radioLabelPosition = "right",
  getOptionLabel,
  getOptionValue,
  disabled = false,
  refreshable = false,
  onRefresh,
}: CustomRadioProps<T>) => {
  const [selected, setSelected] = useState<T | null>(value ?? null);
  const [touched, setTouched] = useState(false);
  const [valid, setValid] = useState<boolean>(!validate);
  const [loading, setLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Sync external value changes
  useEffect(() => {
    setSelected(value ?? null);
    if (validate) setValid(value != null);
  }, [value, validate]);

  const resolveLabelPlacement = useCallback(() => {
    switch (radioLabelPosition) {
      case "left":
        return "start";
      case "right":
        return "end";
      case "top":
        return "top";
      case "bottom":
        return "bottom";
      default:
        return "end";
    }
  }, [radioLabelPosition]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    let newValue: T | null = null;

    if (getOptionValue && options) {
      const option = options.find(
        (o) => String(getOptionValue(o)) === String(rawValue)
      );
      newValue = option ?? null;
    } else {
      newValue = rawValue as unknown as T;
    }

    setSelected(newValue);
    setTouched(true);
    const isValid = !validate || newValue != null;
    setValid(isValid);
    onChange({ value: newValue, valid: isValid });
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setLoading(true);
    setOptionsError(null);
    try {
      const newOptions = await onRefresh();
      if (!newOptions || newOptions.length === 0) {
        setOptionsError("No options available.");
      }
    } catch {
      setOptionsError("Failed to load options.");
    } finally {
      setLoading(false);
    }
  };

  const showError = (validate && touched && !valid) || !options?.length;

  return (
    <FormControl
      component="fieldset"
      disabled={disabled || loading}
      error={showError}
    >
      {label && (
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <FormLabel component="legend">{label}</FormLabel>
          {refreshable && (
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={loading}
              aria-label="refresh options"
            >
              {loading ? <CircularProgress size={15} /> : <Refresh fontSize="small" />}
            </IconButton>
          )}
        </Box>
      )}

      {options && options.length > 0 ? (
        <RadioGroup
          row={direction === "row"}
          value={
            selected
              ? getOptionValue
                ? getOptionValue(selected)
                : (selected as unknown as string)
              : ""
          }
          onChange={handleChange}
        >
          {options.map((opt, idx) => {
            const optionLabel = getOptionLabel ? getOptionLabel(opt) : String(opt);
            const optionValue = getOptionValue ? getOptionValue(opt) : opt;

            return (
              <FormControlLabel
                key={idx}
                value={optionValue}
                control={<Radio />}
                label={optionLabel}
                labelPlacement={resolveLabelPlacement()}
                disabled={disabled}
              />
            );
          })}
        </RadioGroup>
      ) : (
        <Box minHeight="32px" />
      )}

      <Box display="flex" justifyContent="flex-end" mt={0.5} minHeight="20px">
        {optionsError && (
          <Typography variant="caption" color="error" fontSize={13}>
            {optionsError}
          </Typography>
        )}
        {!optionsError && validate && touched && !valid && (
          <Typography variant="caption" color="error" fontSize={13}>
            {validationMessage}
          </Typography>
        )}
      </Box>
    </FormControl>
  );
};

export default CustomRadio;
