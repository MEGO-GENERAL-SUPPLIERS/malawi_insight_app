import React from "react";
import { TextField } from "@mui/material";

export const MemoizedTextField = React.memo(
  ({
    label,
    value,
    onChange,
    onBlur,
    error,
    helperText,
    multiline = false,
    minRows,
    maxRows,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: boolean;
    helperText?: string;
    multiline?: boolean;
    minRows?: number;
    maxRows?: number;
  }) => (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      size="small"
      fullWidth
      multiline={multiline}
      minRows={minRows}
      maxRows={maxRows}
    />
  ),
  (prev, next) =>
    prev.value === next.value &&
    prev.error === next.error &&
    prev.helperText === next.helperText &&
    prev.multiline === next.multiline
);