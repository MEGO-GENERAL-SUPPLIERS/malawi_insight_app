import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Paper,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { fetchRoleLevels } from "~/services/roleLevelService";
import { fetchGroupedPrivileges } from "~/services/privilegeService";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import type { IRoleLevel } from "~/types/interfaces/IRoleLevelInterfaces";
import type { IPrivilege } from "~/types/interfaces/IPrivilegeInterfaces";

interface RoleFormProps {
  initialData?: {
    id: number;
    name: string;
    code?: string;
    role_level_id?: number;
    description?: string;
    privileges?: number[];
    void?: number;
  };
  setSlotData?: (data: any) => void;
}

export interface RoleFormHandle {
  getFormData: () => {
    id: number;
    name: string;
    code?: string;
    role_level_id?: number;
    description?: string;
    privileges: number[];
  };
  resetForm: () => void;
  setFormData: (data: {
    id: number;
    name: string;
    code?: string;
    role_level_id?: number;
    description?: string;
    privileges: number[];
  }) => void;
}

const RoleAddForm = forwardRef<RoleFormHandle, RoleFormProps>(
  ({ initialData, setSlotData }, ref) => {
    const [formData, setFormDataState] = useState({
      id: 0,
      name: "",
      code: "",
      role_level_id: undefined as number | undefined,
      description: "",
      privileges: [] as number[],
    });

    const [roleLevels, setRoleLevels] = useState<IRoleLevel[]>([]);
    const [privileges, setPrivileges] = useState<IPrivilege[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [loadingPrivileges, setLoadingPrivileges] = useState(true);
    const [errorRoles, setErrorRoles] = useState<string | null>(null);
    const [errorPrivileges, setErrorPrivileges] = useState<string | null>(null);
    const [filterText, setFilterText] = useState("");

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
        const response = await fetchGroupedPrivileges();
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

    // Toggle individual child privilege
    const handleChildToggle = (childId: number) => {
      const newPrivileges = formData.privileges.includes(childId)
        ? formData.privileges.filter((id) => id !== childId)
        : [...formData.privileges, childId];
      const newData = { ...formData, privileges: newPrivileges };
      setFormDataState(newData);
      setSlotData?.(newData);
    };

    // Toggle all children of a group
    const handleParentToggle = (childIds: number[]) => {
      const allSelected = childIds.every((id) => formData.privileges.includes(id));
      const newPrivileges = allSelected
        ? formData.privileges.filter((id) => !childIds.includes(id))
        : Array.from(new Set([...formData.privileges, ...childIds]));
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
          code: "",
          role_level_id: undefined,
          description: "",
          privileges: [],
        }),
      setFormData: (data) => setFormDataState((prev) => ({ ...prev, ...data })),
    }));

    return (
      <form autoComplete="off">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Section: Role Info */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <TextField
              label="Role Name"
              name="name"
              variant="outlined"
              size="small"
              fullWidth
              value={formData.name}
              onChange={handleTextChange}
            /> 

            <Box className="relative">
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

              <Box className="absolute -bottom-6 right-0 flex items-center gap-2">
                {loadingRoles ? (
                  <Box className="flex items-center gap-1 text-gray-500">
                    <CircularProgress size={14} />
                    <Typography variant="caption">Loading role levels...</Typography>
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
            <Box>
              <Box className="relative mt-5">
                <FormControl size="small" fullWidth>
                  <TextField 
                    label="Code / Short Name"
                    fullWidth
                    size="small"
                    variant="outlined"
                    name="code"
                    value={formData.code}
                    onChange={handleTextChange}
                  />
                </FormControl>
              </Box>

              <Box className="relative mt-4">
                  <FormControl size="small" fullWidth>
                    <TextField 
                      label="Role Description"
                      fullWidth
                      size="small"
                      variant="outlined"
                      name="description"
                      placeholder="optional description of the role" 
                      multiline
                      rows={3}
                      value={formData.description || ""}
                      onChange={handleTextChange}
                      />
                  </FormControl>
              </Box>
            </Box>
          </div>

          {/* Right Section: Privileges */}
          <div className="lg:col-span-3">
            <Paper className="p-4 rounded-xl shadow-xm border border-gray-300">
              <Box className="flex justify-between items-center mb-3">
                <div className="flex gap-2 justify-center space-y-4">
                  <Typography variant="subtitle1" className="font-semibold">
                    {"Grouped Privileges"}
                  </Typography>
                  <Tooltip title="Refresh privileges">
                    <span>
                      <IconButton
                        size="small"
                        onClick={loadPrivileges}
                        disabled={loadingPrivileges}
                      >
                        {loadingPrivileges ? (
                          <CircularProgress size={16} />
                        ) : (
                          <RefreshCcw size={16} />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </div>
                <Box className="flex items-center gap-2">
                  <TextField
                    size="small"
                    placeholder="Filter groups..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </Box>
              </Box>

              <Divider className="mb-3" />

              {/* Select All */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      privileges.flatMap(g => g.children?.map(c => c.id) ?? []).every(id =>
                        formData.privileges.includes(id)
                      )
                    }
                    onChange={(e) => {
                      const allChildIds = privileges.flatMap(g => g.children?.map(c => c.id) ?? []);
                      const newPrivileges = e.target.checked
                        ? Array.from(new Set([...formData.privileges, ...allChildIds]))
                        : formData.privileges.filter(id => !allChildIds.includes(id));
                      setFormDataState({ ...formData, privileges: newPrivileges });
                      setSlotData?.({ ...formData, privileges: newPrivileges });
                    }}
                    sx={{ color: 'red' }}
                  />
                }
                label={<Typography className="font-bold text-red-600">Select All</Typography>}
              />

              {loadingPrivileges ? (
                <Box className="flex items-center gap-2 text-gray-500">
                  <CircularProgress size={16} />
                  <Typography variant="caption">Loading privileges...</Typography>
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
                <div className="space-y-4 mt-4">
                  {privileges
                    .filter((group) =>
                      group.name.toLowerCase().includes(filterText.toLowerCase())
                    )
                    .map((group) => {
                      const childIds = group.children?.map((c) => c.id) ?? [];
                      const allChildrenSelected = childIds.length > 0 && childIds.every(id =>
                        formData.privileges.includes(id)
                      );

                      return (
                        <Paper
                          key={group.id}
                          className="p-3 rounded-lg border border-gray-200 bg-gray-50"
                        >
                          {/* Parent */}
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={allChildrenSelected}
                                onChange={() => handleParentToggle(childIds)}
                              />
                            }
                            label={
                              <Typography color="primary">
                                <span className="font-extrabold">{group.name}</span>
                              </Typography>
                            }
                          />

                          {/* Children */}
                          {group.children && group.children.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                              {group.children.map((child) => (
                                <FormControlLabel
                                  key={child.id}
                                  control={
                                    <Checkbox
                                      checked={formData.privileges.includes(child.id)}
                                      onChange={() => handleChildToggle(child.id)}
                                    />
                                  }
                                  label={child.name}
                                />
                              ))}
                            </div>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              No child privileges
                            </Typography>
                          )}
                        </Paper>
                      );
                    })}
                </div>
              )}
            </Paper>
          </div>
        </div>
      </form>
    );
  }
);

export default RoleAddForm;
