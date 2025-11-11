import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  InputAdornment,
} from "@mui/material";
import * as LucideIcons from "lucide-react";
import * as MuiIcons from "@mui/icons-material";
import type { IconType } from "react-icons";

export interface CustomInputProps {
  value?: string;
  label?: string;
  disabled?: boolean;
  iconName?: string;
  iconLibrary?: "lucide" | "mui" | "react";
  iconPosition?: "left" | "right";
  onIconClick?: () => void;
  onChange: (payload: { value: string; valid: boolean }) => void;
  validate?: boolean;
  validationMessage?: string;
  validationMethod?: (value: string) => boolean;
  liveValidation?: boolean;
  showErrorIcon?: boolean; // 👈 new prop
}

export const CustomInput: React.FC<CustomInputProps> = ({
  value = "",
  label = "Input",
  disabled = false,
  iconName,
  iconLibrary = "lucide",
  iconPosition = "right",
  onIconClick,
  onChange,
  validate = false,
  validationMessage = "Invalid input",
  validationMethod,
  liveValidation = true,
  showErrorIcon = true, // default true
}) => {
  const [inputValue, setInputValue] = useState<string>(value);
  const [touched, setTouched] = useState(false);
  const [valid, setValid] = useState<boolean>(!validate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleValidation = (val: string): boolean => {
    if (!validate) return true;
    if (validationMethod) return validationMethod(val);
    return val.trim().length > 0;
  };

  const updateValidationState = (val: string) => {
    const isValid = handleValidation(val);
    setValid(isValid);
    setErrorMessage(isValid ? null : validationMessage);
    onChange({ value: val, valid: isValid });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (liveValidation) {
      updateValidationState(val);
    } else {
      timeoutRef.current = setTimeout(() => {
        updateValidationState(val);
      }, 2500);
      onChange({ value: val, valid: true });
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (!liveValidation) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      updateValidationState(inputValue);
    }
  };

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

    if (!IconComponent) return null;

    return (
      <InputAdornment position={iconPosition === "left" ? "start" : "end"}>
        <IconButton
          edge={iconPosition === "left" ? "start" : "end"}
          onClick={onIconClick}
          disabled={disabled}
        >
          <IconComponent fontSize="small" />
        </IconButton>
      </InputAdornment>
    );
  };

  const renderErrorIcon = () => {
    if (!showErrorIcon || valid) return null;
    return (
      <InputAdornment position="end">
        <LucideIcons.AlertTriangle size={16} color="red" />
      </InputAdornment>
    );
  };

  return (
    <Box position="relative" width="100%">
      <TextField
        fullWidth
        size="small"
        label={label}
        disabled={disabled}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched && validate && !valid}
        slotProps={{
          input: {
            startAdornment: iconPosition === "left" ? renderIcon() : undefined,
            endAdornment: (
              <>
                {iconPosition === "right" && renderIcon()}
                {touched && validate && !valid && renderErrorIcon()}
              </>
            ),
          },
        }}
      />

      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        mt={0.5}
        minHeight="20px"
      >
        {touched && validate && !valid && (
          <Typography variant="caption" color="error" fontSize={13}>
            {errorMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CustomInput;
