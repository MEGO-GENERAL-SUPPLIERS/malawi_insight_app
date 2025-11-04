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
    privileges?: IPrivilege[];
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
    privileges: IPrivilege[];
  };
  resetForm: () => void;
  setFormData: (data: {
    id: number;
    name: string;
    code?: string;
    role_level_id?: number;
    description?: string;
    privileges: IPrivilege[];
  }) => void;
}

const RoleAddForm = forwardRef<RoleFormHandle, RoleFormProps>(({ initialData, setSlotData }, ref) => {
  const [formData, setFormDataState] = useState({
    id: 0,
    name: "",
    code: "",
    role_level_id: undefined as number | undefined,
    description: "",
    privileges: [] as IPrivilege[],
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
      if (!response.success || !response.data || response.data.length === 0) {
        setErrorRoles(response.message ?? "No role levels found");
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
      if (!response.success || !response.data || response.data.length === 0) {
        setErrorPrivileges(response.message ?? "No privileges found");
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

  // Initialize form with initial data
  useEffect(() => {
    if (initialData && !loadingPrivileges && privileges.length > 0) {
      const initialPrivileges = initialData.privileges?.map(p =>
        privileges.flatMap(g => g.children ?? []).find(c => c.id === p.id)
      ).filter(Boolean) as IPrivilege[];

      setFormDataState(prev => ({
        ...prev,
        ...initialData,
        privileges: initialPrivileges,
      }));
    }
  }, [initialData, loadingPrivileges, privileges]);

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
  const handleChildToggle = (child: IPrivilege) => {
    const exists = formData.privileges.some(p => p.id === child.id);
    const newPrivileges = exists
      ? formData.privileges.filter(p => p.id !== child.id)
      : [...formData.privileges, child];

    const newData = { ...formData, privileges: newPrivileges };
    setFormDataState(newData);
    setSlotData?.(newData);
  };

  // Toggle all children of a group
  const handleParentToggle = (children: IPrivilege[]) => {
    const allSelected = children.every(child => formData.privileges.some(p => p.id === child.id));
    const newPrivileges = allSelected
      ? formData.privileges.filter(p => !children.some(c => c.id === p.id))
      : Array.from(new Set([...formData.privileges, ...children]));

    const newData = { ...formData, privileges: newPrivileges };
    setFormDataState(newData);
    setSlotData?.(newData);
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getFormData: () => formData,
    resetForm: () => setFormDataState({ id: 0, name: "", code: "", role_level_id: undefined, description: "", privileges: [] }),
    setFormData: (data) => setFormDataState(prev => ({ ...prev, ...data })),
  }));

  // Helper for select all checkbox
  const allPrivilegesSelected = privileges.flatMap(g => g.children ?? [])
    .every(child => formData.privileges.some(p => p.id === child.id));

  return (
    <form autoComplete="off">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <TextField
            label="Role Name *"
            name="name"
            variant="outlined"
            size="small"
            fullWidth
            value={formData.name}
            onChange={handleTextChange}
          />
          <Box className="relative">
            <FormControl size="small" fullWidth>
              <InputLabel>Role Level *</InputLabel>
              <Select
                label="Role Level *"
                name="role_level_id"
                value={formData.role_level_id || ""}
                onChange={handleSelectChange}
                disabled={loadingRoles || !!errorRoles}
              >
                <MenuItem value="">
                  <em>{loadingRoles ? "Loading..." : "Select Role Level *"}</em>
                </MenuItem>
                {roleLevels.map(rl => (
                  <MenuItem key={rl.id} value={rl.id}>{rl.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box className="absolute -bottom-6 right-0 flex items-center gap-2">
              {loadingRoles && (
                <Box className="flex items-center gap-1 text-gray-500">
                  <CircularProgress size={14} />
                  <Typography variant="caption">Loading role levels...</Typography>
                </Box>
              )}
              {errorRoles && (
                <Typography variant="caption" color="error" className="flex items-center gap-1">
                  <AlertTriangle size={14} className="text-red-500" />
                  {errorRoles}
                  <Tooltip title="Retry loading role levels">
                    <IconButton size="small" onClick={loadRoleLevels} className="text-red-500 hover:text-red-700">
                      <RefreshCcw size={14} />
                    </IconButton>
                  </Tooltip>
                </Typography>
              )}
            </Box>
          </Box>

          <TextField
            label="Code / Short Name"
            name="code"
            variant="outlined"
            size="small"
            fullWidth
            value={formData.code}
            onChange={handleTextChange}
          />

          <TextField
            label="Role Description"
            name="description"
            variant="outlined"
            size="small"
            fullWidth
            multiline
            rows={3}
            placeholder="Optional description"
            value={formData.description}
            onChange={handleTextChange}
          />
        </div>

        {/* Right Section */}
        <div className="lg:col-span-3">
          <Paper className="p-4 rounded-xl shadow-xm border border-gray-300">
            <Box className="flex justify-between items-center mb-3">
              <Typography variant="subtitle1" className="font-semibold">Grouped Privileges</Typography>
              <Box className="flex items-center gap-2">
                <TextField size="small" placeholder="Filter groups..." value={filterText} onChange={(e) => setFilterText(e.target.value)} />
                <Tooltip title="Refresh privileges">
                  <IconButton size="small" onClick={loadPrivileges} disabled={loadingPrivileges}>
                    {loadingPrivileges ? <CircularProgress size={16} /> : <RefreshCcw size={16} />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider className="mb-3" />

            <FormControlLabel
              control={
                <Checkbox
                  checked={allPrivilegesSelected}
                  onChange={() => {
                    const allChildren = privileges.flatMap(g => g.children ?? []);
                    handleParentToggle(allChildren);
                  }}
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
              <Typography variant="caption" color="error" className="flex items-center gap-1 mt-1">
                <AlertTriangle size={14} className="text-red-500" />
                {errorPrivileges}
                <Tooltip title="Retry loading privileges">
                  <IconButton size="small" onClick={loadPrivileges} className="text-red-500 hover:text-red-700">
                    <RefreshCcw size={14} />
                  </IconButton>
                </Tooltip>
              </Typography>
            ) : (
              privileges
                .filter(g => g.name.toLowerCase().includes(filterText.toLowerCase()))
                .map(group => {
                  const childPrivileges = group.children ?? [];
                  const allChildrenSelected = childPrivileges.length > 0 && childPrivileges.every(c => formData.privileges.some(p => p.id === c.id));

                  return (
                    <Paper key={group.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50 mb-3">
                      <FormControlLabel
                        control={<Checkbox checked={allChildrenSelected} onChange={() => handleParentToggle(childPrivileges)} />}
                        label={<Typography color="primary" className="font-extrabold">{group.name}</Typography>}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                        {childPrivileges.map(child => (
                          <FormControlLabel
                            key={child.id}
                            control={<Checkbox checked={formData.privileges.some(p => p.id === child.id)} onChange={() => handleChildToggle(child)} />}
                            label={child.name}
                          />
                        ))}
                      </div>
                    </Paper>
                  );
                })
            )}
          </Paper>
        </div>
      </div>
    </form>
  );
});

export default RoleAddForm;
