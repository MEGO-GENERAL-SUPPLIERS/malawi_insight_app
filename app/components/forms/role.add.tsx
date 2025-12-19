import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Checkbox,
  FormControlLabel,
  useTheme,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import type { IRoleLevel } from "~/types/interfaces/IRoleLevelInterfaces";
import type { IPrivilege } from "~/types/interfaces/IPrivilegeInterfaces";
import { fetchRoleLevels } from "~/services/roleLevelService";
import { fetchAllPrivileges } from "~/services/privilegeService";

// Update PrivilegeNode to match your API + support nesting
interface PrivilegeNode {
  id: number;
  name: string;
  void: number; // 0 = active, 1 = voided
  children?: PrivilegeNode[];
}

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

// Utility: Build tree from flat list
const buildPrivilegeTree = (flat: IPrivilege[]): PrivilegeNode[] => {
  const nodeMap = new Map<number, PrivilegeNode>();
  flat.forEach(p => {
    nodeMap.set(p.id, {
      id: p.id,
      name: p.name,
      void: p.void ?? 0,
    });
  });

  const roots: PrivilegeNode[] = [];
  const childrenMap = new Map<number, PrivilegeNode[]>();

  flat.forEach(p => {
    if (p.parent_id && p.parent_id !== 0 && nodeMap.has(p.parent_id)) {
      if (!childrenMap.has(p.parent_id)) {
        childrenMap.set(p.parent_id, []);
      }
      childrenMap.get(p.parent_id)!.push(nodeMap.get(p.id)!);
    } else {
      roots.push(nodeMap.get(p.id)!);
    }
  });

  nodeMap.forEach((node, id) => {
    if (childrenMap.has(id)) {
      node.children = childrenMap.get(id)!.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }
  });

  return roots.sort((a, b) => a.name.localeCompare(b.name));
};

// Utility: Get all descendant IDs (including self)
const getAllDescendantIds = (node: PrivilegeNode): number[] => {
  const ids: number[] = [node.id];
  if (node.children) {
    node.children.forEach(child => {
      ids.push(...getAllDescendantIds(child));
    });
  }
  return ids;
};

// ✅ NEW: Count visible (non-voided) direct children
const countVisibleChildren = (children: PrivilegeNode[] | undefined): number => {
  return children?.filter(child => child.void !== 1).length || 0;
};

// Recursive Tree Node Component
const PrivilegeTreeNode = React.memo<{
  node: PrivilegeNode;
  selectedIds: Set<number>;
  onToggle: (node: PrivilegeNode) => void;
  filterText: string;
}>(({ node, selectedIds, onToggle, filterText }) => {
  const theme = useTheme();
  const isLeaf = !node.children || node.children.length === 0;
  const isSelected = selectedIds.has(node.id);
  const allDescendantsSelected = node.children
    ? getAllDescendantIds(node).every(id => selectedIds.has(id))
    : isSelected;
  const anyDescendantSelected = node.children
    ? getAllDescendantIds(node).some(id => selectedIds.has(id))
    : isSelected;
  const indeterminate = !isLeaf && anyDescendantSelected && !allDescendantsSelected;

  const handleToggle = () => onToggle(node);

  if (node.void === 1) return null;

  const matchesFilter = (n: PrivilegeNode): boolean => {
    if (n.name.toLowerCase().includes(filterText.toLowerCase())) return true;
    if (n.children) return n.children.some(matchesFilter);
    return false;
  };

  const shouldRender = !filterText || matchesFilter(node);
  if (!shouldRender) return null;

  // === LEAF NODE ===
  if (isLeaf) {
    return (
      <Box
        sx={{
          flex: {
            xs: '1 1 100%',
            sm: '1 1 calc(50% - 8px)',
            md: '1 1 calc(33.333% - 12px)',
          },
          minWidth: 0,
        }}
      >
        <FormControlLabel
          control={<Checkbox checked={isSelected} onChange={handleToggle} size="small" />}
          label={
            <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
              {node.name}
            </Typography>
          }
          sx={{ alignItems: 'center', ml: 0, width: '100%', display: 'flex' }}
        />
      </Box>
    );
  }

  // === PARENT NODE ===
  const visibleChildCount = countVisibleChildren(node.children);
  let columns: 1 | 2 | 3 = 3;

  if (visibleChildCount > 0) {
    if (visibleChildCount % 3 === 0) {
      columns = 3;
    } else if (visibleChildCount % 2 === 0) {
      columns = 2;
    } else {
      columns = 1;
    }
  }

  // Dynamically adjust flex basis based on column count
  const getFlexBasis = (col: number) => {
    if (col === 1) return '100%';
    if (col === 2) return 'calc(50% - 8px)';
    return 'calc(33.333% - 12px)';
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 2.5,
        borderRadius: "5px", // default MUI borderRadius = 4px
        borderColor: theme.palette.divider,
        // ✅ Lighter gray background
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.04)'
          : 'rgba(0, 0, 0, 0.02)',
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={allDescendantsSelected}
            indeterminate={indeterminate}
            onChange={handleToggle}
            sx={{
              color: indeterminate ? theme.palette.primary.main : undefined,
            }}
          />
        }
        label={
          <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
            {node.name}
          </Typography>
        }
        sx={{ alignItems: 'center', ml: 0, width: '100%' }}
      />

      {node.children && node.children.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            mt: 1.5,
          }}
        >
          {node.children.map(child => {
            if (child.void === 1) return null;
            return (
              <Box
                key={child.id}
                sx={{
                  flex: {
                    xs: '1 1 100%',
                    sm: columns >= 2 ? '1 1 calc(50% - 8px)' : '1 1 100%',
                    md: columns === 3 ? '1 1 calc(33.333% - 12px)' : 
                         columns === 2 ? '1 1 calc(50% - 8px)' : '1 1 100%',
                  },
                  minWidth: 0,
                }}
              >
                <PrivilegeTreeNode
                  node={child}
                  selectedIds={selectedIds}
                  onToggle={onToggle}
                  filterText={filterText}
                />
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
});

// ... rest of the file remains unchanged (RoleAddForm, etc.)
// Only the PrivilegeTreeNode and helper utils above were modified.

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
  const [privilegesTree, setPrivilegesTree] = useState<PrivilegeNode[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [errorRoles, setErrorRoles] = useState<string | null>(null);
  const [errorPrivileges, setErrorPrivileges] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");

  const loadRoleLevels = async () => {
    setLoadingRoles(true);
    setErrorRoles(null);
    try {
      const response = await fetchRoleLevels();
      if (!response.success || !response.data) {
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

  const loadPrivileges = async () => {
    setLoadingPrivileges(true);
    setErrorPrivileges(null);
    try {
      const response = await fetchAllPrivileges();
      if (!response.success || !response.data) {
        setErrorPrivileges(response.message ?? "No privileges found");
        setPrivilegesTree([]);
      } else {
        const tree = buildPrivilegeTree(response.data);
        setPrivilegesTree(tree);
      }
    } catch (err: any) {
      setErrorPrivileges(`Failed to load privileges: ${err.message}`);
      setPrivilegesTree([]);
    } finally {
      setLoadingPrivileges(false);
    }
  };

  useEffect(() => {
    loadRoleLevels();
    loadPrivileges();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormDataState({
        id: initialData.id,
        name: initialData.name,
        code: initialData.code ?? "",
        role_level_id: initialData.role_level_id,
        description: initialData.description ?? "",
        privileges: initialData.privileges ?? [],
      });
    }
  }, [initialData]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormDataState(newData);
    setSlotData?.(newData);
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    const newValue = value === "" ? undefined : Number(value);
    const newData = { ...formData, [name]: newValue };
    setFormDataState(newData);
    setSlotData?.(newData);
  };

  const handlePrivilegeToggle = useCallback((node: PrivilegeNode) => {
    setFormDataState(prev => {
      const selectedIds = new Set(prev.privileges.map(p => p.id));
      const descendants = getAllDescendantIds(node);
      const currentlySelected = descendants.every(id => selectedIds.has(id));

      if (currentlySelected) {
        descendants.forEach(id => selectedIds.delete(id));
      } else {
        descendants.forEach(id => selectedIds.add(id));
      }

      const flattenTree = (nodes: PrivilegeNode[]): IPrivilege[] => {
        let result: IPrivilege[] = [];
        const traverse = (n: PrivilegeNode) => {
          result.push({
            id: n.id,
            name: n.name,
            void: n.void,
            parent_id: undefined,
            action_name: "",
            description: "",
            created_at: "",
            updated_at: "",
          });
          if (n.children) n.children.forEach(traverse);
        };
        nodes.forEach(traverse);
        return result;
      };

      const allPrivs = flattenTree(privilegesTree);
      const newPrivileges = allPrivs.filter(p => selectedIds.has(p.id));

      const newData = { ...prev, privileges: newPrivileges };
      setSlotData?.(newData);
      return newData;
    });
  }, [privilegesTree, setSlotData]);

  const allPrivilegeIds = useMemo(() => {
    const getAllIds = (nodes: PrivilegeNode[]): number[] => {
      let ids: number[] = [];
      nodes.forEach(node => {
        ids.push(node.id);
        if (node.children) ids.push(...getAllIds(node.children));
      });
      return ids;
    };
    return getAllIds(privilegesTree);
  }, [privilegesTree]);

  const selectedPrivilegeIds = useMemo(() => {
    return new Set(formData.privileges.map(p => p.id));
  }, [formData.privileges]);

  const visiblePrivilegeIds = useMemo(() => {
    const getVisibleIds = (nodes: PrivilegeNode[]): number[] => {
      let ids: number[] = [];
      nodes.forEach(node => {
        if (node.void !== 1) {
          ids.push(node.id);
        }
        if (node.children) ids.push(...getVisibleIds(node.children));
      });
      return ids;
    };
    return new Set(getVisibleIds(privilegesTree));
  }, [privilegesTree]);

  const allVisibleSelected = allPrivilegeIds.length > 0 && 
    Array.from(visiblePrivilegeIds).every(id => selectedPrivilegeIds.has(id));

  const handleSelectAll = () => {
    setFormDataState(prev => {
      const newPrivileges = allVisibleSelected 
        ? [] 
        : privilegesTree.flatMap(node => {
            const flatten = (n: PrivilegeNode): IPrivilege[] => {
              if (n.void === 1) return [];
              const self: IPrivilege = {
                id: n.id,
                name: n.name,
                void: n.void,
                parent_id: undefined,
                action_name: "",
                description: "",
                created_at: "",
                updated_at: "",
              };
              return n.children 
                ? [self, ...n.children.flatMap(flatten)]
                : [self];
            };
            return flatten(node);
          });

      const newData = { ...prev, privileges: newPrivileges };
      setSlotData?.(newData);
      return newData;
    });
  };

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
    setFormData: (data) => setFormDataState(prev => ({ ...prev, ...data })),
  }));

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
                {roleLevels.map((rl) => (
                  <MenuItem key={rl.id} value={rl.id}>
                    {rl.name}
                  </MenuItem>
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
          <Paper className="p-4 rounded-xl shadow-sm border border-gray-200">
            <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <Typography variant="subtitle1" className="font-semibold">
                Privileges
              </Typography>
              <Box className="flex items-center gap-2">
                <TextField
                  size="small"
                  placeholder="Filter privileges..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  fullWidth
                  sx={{ width: { xs: '100%', sm: 200 } }}
                />
                <Tooltip title="Refresh privileges">
                  <IconButton size="small" onClick={loadPrivileges} disabled={loadingPrivileges}>
                    {loadingPrivileges ? <CircularProgress size={16} /> : <RefreshCcw size={16} />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <FormControlLabel
              control={<Checkbox checked={allVisibleSelected} onChange={handleSelectAll} />}
              label={<Typography className="font-bold">Select All</Typography>}
              sx={{ mb: 2 }}
            />

            {loadingPrivileges ? (
              <Box className="flex items-center gap-2 text-gray-500 py-4">
                <CircularProgress size={16} />
                <Typography variant="body2">Loading privileges...</Typography>
              </Box>
            ) : errorPrivileges ? (
              <Typography variant="body2" color="error" className="flex items-center gap-1 py-4">
                <AlertTriangle size={16} className="text-red-500" />
                {errorPrivileges}
                <Tooltip title="Retry loading privileges">
                  <IconButton size="small" onClick={loadPrivileges} className="text-red-500 hover:text-red-700">
                    <RefreshCcw size={16} />
                  </IconButton>
                </Tooltip>
              </Typography>
            ) : privilegesTree.length === 0 ? (
              <Typography variant="body2" color="text.secondary" className="py-4">
                No privileges available.
              </Typography>
            ) : (
              <Box>
                {privilegesTree.map((node) => (
                  <PrivilegeTreeNode
                    key={node.id}
                    node={node}
                    selectedIds={selectedPrivilegeIds}
                    onToggle={handlePrivilegeToggle}
                    filterText={filterText}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </div>
      </div>
    </form>
  );
});

export default RoleAddForm;