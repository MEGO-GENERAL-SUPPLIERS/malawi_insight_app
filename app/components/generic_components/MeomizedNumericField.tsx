// app/components/generic_components/MemoizedNumericField.tsx
import React from "react";
import { TextField } from "@mui/material";

export const MemoizedNumericField = React.memo(
  ({
    label,
    value,
    onChange,
    onBlur,
    error,
    helperText,
  }: {
    label: string;
    value: string; // string representation of number (for UX: allow empty)
    onChange: (value: string) => void; // raw string input (e.g., "", "5", "12")
    onBlur?: () => void;
    error?: boolean;
    helperText?: string;
  }) => (
    <TextField
      label={label}
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        if (val === "" || /^\d+$/.test(val)) {
          onChange(val);
        }
      }}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      size="small"
      type="text"
      inputMode="numeric"
      fullWidth
    />
  ),
  (prev, next) =>
    prev.value === next.value &&
    prev.error === next.error &&
    prev.helperText === next.helperText
);