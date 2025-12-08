// CustomMultiFieldGroup.tsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import { X, Plus, ListRestartIcon } from "lucide-react";
import CustomInput from "./CustomInput";

export interface DynamicFieldConfig {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  validationMethod?: (value: string) => boolean;
  validationMessage?: string;
}

// Base type: any object with string values
export type RowData = Record<string, any>;

// ✅ Generic props interface
interface CustomMultiFieldGroupProps<T extends RowData> {
  label?: string;
  fields: DynamicFieldConfig[];
  minRows?: number;
  maxRows?: number;
  defaultValue?: T[];
  liveValidation?: boolean;
  showErrorIcon?: boolean;
  showRowNumbers?: boolean;
  addButtonLabel?: string;
  addButtonTooltip?: string;
  onChange: (payload: { values: T[]; valid: boolean }) => void;
}

// ✅ Generic component
export const CustomMultiFieldGroup = <T extends RowData>({
  label,
  fields,
  minRows = 1,
  maxRows = Infinity,
  defaultValue = [],
  liveValidation = true,
  showErrorIcon = true,
  showRowNumbers = false,
  addButtonLabel = "",
  addButtonTooltip = "",
  onChange,
}: CustomMultiFieldGroupProps<T>) => {
  const fieldNames = fields.map((f) => f.name);

  // Helper: create empty row of type T
  const createEmptyRow = (): T => {
    return fieldNames.reduce((acc, name) => {
      (acc as Record<string, string>)[name] = "";
      return acc;
    }, {} as T);
  };

  // Initialize rows with ID
  type RowWithId = T & { id: string };

  const getInitialRows = (): RowWithId[] => {
    const initial: RowWithId[] = defaultValue
      .slice(0, maxRows)
      .map((row, i) => ({
        ...row,
        id: `row-${i}`,
      }));

    while (initial.length < minRows) {
      initial.push({
        ...createEmptyRow(),
        id: `row-${initial.length}`,
      });
    }

    return initial.slice(0, maxRows);
  };

  const [rows, setRows] = useState<RowWithId[]>(getInitialRows());

  const handleReset = () => {
    const resetRows = Array.from({ length: minRows }, (_, i) => ({
      ...createEmptyRow(),
      id: `row-${i}`,
    }));
    setRows(resetRows);
  };

  const handleAddRow = () => {
    if (rows.length >= maxRows) return;
    setRows((prev) => [
      ...prev,
      {
        ...createEmptyRow(),
        id: `row-${Date.now()}`,
      },
    ]);
  };

  const handleRemoveRow = (idToRemove: string) => {
    if (rows.length <= minRows) return;
    setRows((prev) => prev.filter((row) => row.id !== idToRemove));
  };

  const validateRows = (values: T[]): boolean => {
    for (const row of values) {
      for (const field of fields) {
        const fieldValue = row[field.name as keyof T] as string | undefined;
        if (field.required && (!fieldValue || fieldValue.trim() === "")) return false;
        if (field.validationMethod && fieldValue && !field.validationMethod(fieldValue)) return false;
      }
    }
    return true;
  };

  const handleFieldChange = (rowIndex: number, fieldName: string, value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [fieldName]: value };
      const values = updated.map(({ id, ...rest }) => rest as unknown as T);
      const valid = validateRows(values);
      Promise.resolve().then(() => {
        onChange({ values, valid });
      });
      return updated;
    });
  };

  // Validation & value extraction
  const { values, valid } = useMemo(() => {
    const values = rows.map(({ id, ...rest }) => rest as unknown as T);
    let overallValid = true;

    validationLoop:
    for (const row of values) {
      for (const field of fields) {
        const fieldValue = row[field.name as keyof T] as string | undefined;
        const isRequired = field.required ?? false;
        const validator = field.validationMethod;

        if (isRequired && (!fieldValue || fieldValue.trim() === "")) {
          overallValid = false;
          break validationLoop;
        }

        if (validator && fieldValue && fieldValue.trim() !== "") {
          if (!validator(fieldValue)) {
            overallValid = false;
            break validationLoop;
          }
        }
      }
    }

    return { values, valid: overallValid };
  }, [rows, fields]);


  return (
    <Box width="100%">
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Box display="flex" alignItems="center">
          <Typography variant="body2" fontWeight="medium">
            {label}
          </Typography>
          <Tooltip title="Reset Rows">
            <IconButton size="small" className="ml-6" onClick={handleReset} sx={{ ml: 1 }}>
              <ListRestartIcon size={16} />
            </IconButton>
          </Tooltip>
        </Box>

        {rows.length < maxRows && (
          <Tooltip title={addButtonTooltip || addButtonLabel || "Add row"}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={handleAddRow}
              className="bg-red-400"
              sx={{
                backgroundColor: 'blue.600',
                color: 'white',
                textTransform: 'none',
                fontSize: '0.8125rem',
                minWidth: 'auto',
                px: 1,
                '&:hover': { backgroundColor: 'blue.700' },
              }}
            >
              { addButtonLabel ? <small>{addButtonLabel}</small> : "" }
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Rows */}
      <Box display="flex" flexDirection="column" gap={1}>
        {rows.map((row, rowIndex) => (
          <Box
            key={row.id}
            display="flex"
            alignItems="flex-start"
            gap={1.5}
            flexWrap="wrap"
          >
            {showRowNumbers && (
              <Box
                sx={{
                  mt: '8px',
                  minWidth: '24px',
                  textAlign: 'right',
                  fontWeight: 'semibold',
                  color: 'text.secondary'
                }}
              >
                {rowIndex + 1}{"."}
              </Box>
            )}

            {fields.map((field) => (
              <Box key={field.name} flex={1} minWidth={140}>
                <CustomInput
                  label={field.label}
                  value={(row[field.name as keyof T] ?? "") as string}
                  placeholderText={field.placeholder || ""}
                  onChange={(payload) =>
                    handleFieldChange(rowIndex, field.name, payload.value)
                  }
                  validate={field.required || !!field.validationMethod}
                  validationMessage={field.validationMessage || "Invalid input"}
                  validationMethod={field.validationMethod}
                  liveValidation={liveValidation}
                  showErrorIcon={showErrorIcon}
                />
              </Box>
            ))}

            {rows.length > minRows && (
              <IconButton
                size="small"
                onClick={() => handleRemoveRow(row.id)}
                sx={{ mt: '4px', color: 'error.main' }}
              >
                <X size={16} />
              </IconButton>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CustomMultiFieldGroup;