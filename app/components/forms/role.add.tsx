import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { fetchRoleLevels } from "~/services/roleLevelService";
import { fetchPrivileges } from "~/services/privilegeService";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import type { IRoleLevel } from "~/types/interfaces/IRoleLevelInterfaces";
import type { IPrivilege } from "~/types/interfaces/IPrivilegeInterfaces";

interface RoleFormProps {
  initialData?: {
    id: number;
    name: string;
    role_level_id?: number;
    privileges?: number[];
    void?: number;
  };
  setSlotData?: (data: any) => void;
}

export interface RoleFormHandle {
  getFormData: () => {
    id: number;
    name: string;
    role_level_id?: number;
    privileges: number[];
  };
  resetForm: () => void;
  setFormData: (data: {
    id: number;
    name: string;
    role_level_id?: number;
    privileges: number[];
  }) => void;
}

const RoleAddForm = forwardRef<RoleFormHandle, RoleFormProps>(
  ({ initialData, setSlotData }, ref) => {
    const [formData, setFormDataState] = useState({
      id: 0,
      name: "",
      role_level_id: undefined as number | undefined,
      privileges: [] as number[],
    });

    const [roleLevels, setRoleLevels] = useState<IRoleLevel[]>([]);
    const [privileges, setPrivileges] = useState<IPrivilege[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [loadingPrivileges, setLoadingPrivileges] = useState(true);
    const [errorRoles, setErrorRoles] = useState<string | null>(null);
    const [errorPrivileges, setErrorPrivileges] = useState<string | null>(null);

    // Load Role Levels
    const loadRoleLevels = async () => {
      setLoadingRoles(true);
      setErrorRoles(null);
      try {
        const response = await fetchRoleLevels();
        if (!response.success) {
          setErrorRoles(response.message ?? "Failed to load role levels");
          setRoleLevels([]);
        } else if (!response.data || response.data.length === 0) {
          setErrorRoles("No role levels found");
          setRoleLevels([]);
        } else {
          setRoleLevels(response.data);
        }
      } catch (err: any) {
        setErrorRoles(`Failed to load role levels: ${err.message}`);
        setRoleLevels([]);
      } finally {
        setLoadingRoles(false);
      }
    };

    // Load Privileges
    const loadPrivileges = async () => {
      setLoadingPrivileges(true);
      setErrorPrivileges(null);
      try {
        const response = await fetchPrivileges();
        if (!response.success) {
          setErrorPrivileges(response.message ?? "Failed to load privileges");
          setPrivileges([]);
        } else if (!response.data || response.data.length === 0) {
          setErrorPrivileges("No privileges found");
          setPrivileges([]);
        } else {
          setPrivileges(response.data);
        }
      } catch (err: any) {
        setErrorPrivileges(`Failed to load privileges: ${err.message}`);
        setPrivileges([]);
      } finally {
        setLoadingPrivileges(false);
      }
    };

    useEffect(() => {
      loadRoleLevels();
      loadPrivileges();
    }, []);

    // Handle initial edit mode
    useEffect(() => {
      if (initialData) {
        setFormDataState((prev) => ({
          ...prev,
          ...initialData,
          privileges: initialData.privileges ?? [],
        }));
      }
    }, [initialData]);

    // Handle text input
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const newData = { ...formData, [name]: value };
      setFormDataState(newData);
      setSlotData?.(newData);
    };

    // Handle select input
    const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
      const { name, value } = e.target;
      const newValue = isNaN(Number(value)) ? value : Number(value);
      const newData = { ...formData, [name]: newValue };
      setFormDataState(newData);
      setSlotData?.(newData);
    };

    // Handle privilege toggle
    const handlePrivilegeToggle = (privId: number) => {
      const newPrivileges = formData.privileges.includes(privId)
        ? formData.privileges.filter((p) => p !== privId)
        : [...formData.privileges, privId];
      const newData = { ...formData, privileges: newPrivileges };
      setFormDataState(newData);
      setSlotData?.(newData);
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getFormData: () => formData,
      resetForm: () =>
        setFormDataState({
          id: 0,
          name: "",
          role_level_id: undefined,
          privileges: [],
        }),
      setFormData: (data) => setFormDataState((prev) => ({ ...prev, ...data })),
    }));

    return (
      <form autoComplete="off">
        <div className="flex flex-col gap-6">
          {/* Row: Role Name + Role Level */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* Role Name */}
            <Box className="flex-1">
              <TextField
                label="Role Name"
                name="name"
                variant="outlined"
                size="small"
                fullWidth
                value={formData.name}
                onChange={handleTextChange}
              />
            </Box>

            {/* Role Level */}
            <Box className="flex-1 relative">
              <FormControl size="small" fullWidth>
                <InputLabel>Role Level</InputLabel>
                <Select
                  label="Role Level"
                  name="role_level_id"
                  value={formData.role_level_id || ""}
                  onChange={handleSelectChange}
                  disabled={loadingRoles || !!errorRoles}
                >
                  <MenuItem value="">
                    <em>{loadingRoles ? "Loading..." : "Select Role Level"}</em>
                  </MenuItem>
                  {roleLevels.map((rl) => (
                    <MenuItem key={rl.id} value={rl.id}>
                      {rl.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Status Section (bottom-right area) */}
              <Box className="absolute bottom-[-22px] right-0 flex items-center gap-1">
                {loadingRoles ? (
                  <Box className="flex items-center gap-1 text-gray-500">
                    <CircularProgress size={14} />
                    <Typography variant="caption">
                      Loading role levels...
                    </Typography>
                  </Box>
                ) : errorRoles ? (
                  <Typography
                    variant="caption"
                    color="error"
                    className="flex items-center gap-1"
                  >
                    <AlertTriangle size={14} className="text-red-500" />
                    {errorRoles}
                    <Tooltip title="Retry loading role levels">
                      <IconButton
                        size="small"
                        onClick={loadRoleLevels}
                        className="text-red-500 hover:text-red-700"
                      >
                        <RefreshCcw size={14} />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </div>

          {/* Privileges */}
          <Box>
            <label className="font-semibold mb-2 block">Privileges</label>

            {loadingPrivileges ? (
              <Box className="flex items-center gap-2 text-gray-500">
                <CircularProgress size={18} />
                <Typography variant="caption">
                  Loading privileges...
                </Typography>
              </Box>
            ) : errorPrivileges ? (
              <Typography
                variant="caption"
                color="error"
                className="flex items-center gap-1 mt-1"
              >
                <AlertTriangle size={14} className="text-red-500" />
                {errorPrivileges}
                <Tooltip title="Retry loading privileges">
                  <IconButton
                    size="small"
                    onClick={loadPrivileges}
                    className="text-red-500 hover:text-red-700"
                  >
                    <RefreshCcw size={14} />
                  </IconButton>
                </Tooltip>
              </Typography>
            ) : (
              <FormGroup>
                {privileges.map((p) => (
                  <FormControlLabel
                    key={p.id}
                    control={
                      <Checkbox
                        checked={formData.privileges.includes(p.id)}
                        onChange={() => handlePrivilegeToggle(p.id)}
                      />
                    }
                    label={p.name}
                  />
                ))}
              </FormGroup>
            )}
          </Box>
        </div>
      </form>
    );
  }
);

export default RoleAddForm;
