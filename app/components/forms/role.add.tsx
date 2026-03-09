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

interface PrivilegeNode {
  id: number;
  name: string;
  void: number;
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
  setFormData: (data: any) => void;
}

const flattenTree = (nodes: PrivilegeNode[]): IPrivilege[] => {
  const result: IPrivilege[] = [];

  const walk = (node: PrivilegeNode, parent?: number) => {
    result.push({
      id: node.id,
      name: node.name,
      void: node.void,
      parent_id: parent,
      action_name: "",
      description: "",
      created_at: "",
      updated_at: "",
    });

    node.children?.forEach((c) => walk(c, node.id));
  };

  nodes.forEach((n) => walk(n));
  return result;
};

const buildParentMap = (flat: IPrivilege[]) => {
  const map = new Map<number, number | undefined>();
  flat.forEach((p) => map.set(p.id, p.parent_id ?? undefined));
  return map;
};

const getAllAncestorIds = (
  id: number,
  parentMap: Map<number, number | undefined>
) => {
  const ids: number[] = [];
  let current = parentMap.get(id);
  while (current) {
    ids.push(current);
    current = parentMap.get(current);
  }
  return ids;
};

const buildPrivilegeTree = (flat: IPrivilege[]): PrivilegeNode[] => {
  const nodeMap = new Map<number, PrivilegeNode>();

  flat.forEach((p) => {
    nodeMap.set(p.id, { id: p.id, name: p.name, void: p.void ?? 0 });
  });

  const roots: PrivilegeNode[] = [];
  const childrenMap = new Map<number, PrivilegeNode[]>();

  flat.forEach((p) => {
    if (p.parent_id && nodeMap.has(p.parent_id)) {
      if (!childrenMap.has(p.parent_id)) childrenMap.set(p.parent_id, []);
      childrenMap.get(p.parent_id)!.push(nodeMap.get(p.id)!);
    } else {
      roots.push(nodeMap.get(p.id)!);
    }
  });

  nodeMap.forEach((node, id) => {
    if (childrenMap.has(id)) {
      node.children = childrenMap
        .get(id)!
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  });

  return roots.sort((a, b) => a.name.localeCompare(b.name));
};

const getAllDescendantIds = (node: PrivilegeNode): number[] => {
  const ids = [node.id];
  node.children?.forEach((c) => ids.push(...getAllDescendantIds(c)));
  return ids;
};

const countVisibleChildren = (children?: PrivilegeNode[]) =>
  children?.filter((c) => c.void !== 1).length || 0;

const PrivilegeTreeNode = React.memo<{
  node: PrivilegeNode;
  selectedIds: Set<number>;
  onToggle: (node: PrivilegeNode) => void;
  filterText: string;
}>(({ node, selectedIds, onToggle, filterText }) => {
  const theme = useTheme();

  if (node.void === 1) return null;

  const isLeaf = !node.children || node.children.length === 0;
  const isSelected = selectedIds.has(node.id);

  const descendants = getAllDescendantIds(node);

  const allSelected = descendants.every((id) => selectedIds.has(id));
  const anySelected = descendants.some((id) => selectedIds.has(id));

  const indeterminate = !isLeaf && anySelected && !allSelected;

  const matchesFilter = (n: PrivilegeNode): boolean => {
    if (n.name.toLowerCase().includes(filterText.toLowerCase())) return true;
    if (n.children) return n.children.some(matchesFilter);
    return false;
  };

  if (filterText && !matchesFilter(node)) return null;

  if (isLeaf) {
    return (
      <Box
        sx={{
          flex: {
            xs: "1 1 100%",
            sm: "1 1 calc(50% - 8px)",
            md: "1 1 calc(33.333% - 12px)",
          },
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={isSelected}
              onChange={() => onToggle(node)}
              size="small"
            />
          }
          label={<Typography variant="body2">{node.name}</Typography>}
          sx={{ ml: 0 }}
        />
      </Box>
    );
  }

  const visibleChildCount = countVisibleChildren(node.children);

  let columns: 1 | 2 | 3 = 3;

  if (visibleChildCount % 3 === 0) columns = 3;
  else if (visibleChildCount % 2 === 0) columns = 2;
  else columns = 1;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 2,
        borderRadius: 2,
        transition: "all 0.15s",
        "&:hover": { boxShadow: theme.shadows[2] },
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={allSelected}
            indeterminate={indeterminate}
            onChange={() => onToggle(node)}
          />
        }
        label={
          <Typography fontWeight="bold" color="primary">
            {node.name}
          </Typography>
        }
        sx={{ ml: 0 }}
      />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          mt: 1,
        }}
      >
        {node.children?.map((child) => (
          <Box
            key={child.id}
            sx={{
              flex:
                columns === 3
                  ? "1 1 calc(33.333% - 12px)"
                  : columns === 2
                  ? "1 1 calc(50% - 8px)"
                  : "1 1 100%",
            }}
          >
            <PrivilegeTreeNode
              node={child}
              selectedIds={selectedIds}
              onToggle={onToggle}
              filterText={filterText}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
});

const RoleAddForm = forwardRef<RoleFormHandle, RoleFormProps>(
  ({ initialData, setSlotData }, ref) => {
    const [formData, setFormData] = useState({
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

    const flatPrivileges = useMemo(
      () => flattenTree(privilegesTree),
      [privilegesTree]
    );

    const parentMap = useMemo(
      () => buildParentMap(flatPrivileges),
      [flatPrivileges]
    );

    const loadRoleLevels = async () => {
      setLoadingRoles(true);
      try {
        const r = await fetchRoleLevels();
        setRoleLevels(r.data || []);
      } catch {
        setErrorRoles("Failed loading role levels");
      } finally {
        setLoadingRoles(false);
      }
    };

    const loadPrivileges = async () => {
      setLoadingPrivileges(true);
      try {
        const r = await fetchAllPrivileges();
        setPrivilegesTree(buildPrivilegeTree(r.data || []));
      } catch {
        setErrorPrivileges("Failed loading privileges");
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
        setFormData((prev) => ({ ...prev, ...initialData }));
      }
    }, [initialData]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const newData = { ...formData, [name]: value };
      setFormData(newData);
      setSlotData?.(newData);
    };

    const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
      const { name, value } = e.target;
      const newValue = value === "" ? undefined : Number(value);
      const newData = { ...formData, [name]: newValue };
      setFormData(newData);
      setSlotData?.(newData);
    };

    const handlePrivilegeToggle = useCallback(
      (node: PrivilegeNode) => {
        setFormData((prev) => {
          const selectedIds = new Set(prev.privileges.map((p) => p.id));

          const descendants = getAllDescendantIds(node);
          const ancestors = getAllAncestorIds(node.id, parentMap);

          const fullySelected = descendants.every((id) =>
            selectedIds.has(id)
          );

          if (fullySelected) {
            descendants.forEach((id) => selectedIds.delete(id));
          } else {
            descendants.forEach((id) => selectedIds.add(id));
            ancestors.forEach((id) => selectedIds.add(id));
          }

          const newPrivileges = flatPrivileges.filter((p) =>
            selectedIds.has(p.id)
          );

          const newData = { ...prev, privileges: newPrivileges };
          setSlotData?.(newData);

          return newData;
        });
      },
      [flatPrivileges, parentMap, setSlotData]
    );

    const selectedIds = useMemo(
      () => new Set(formData.privileges.map((p) => p.id)),
      [formData.privileges]
    );

    useImperativeHandle(ref, () => ({
      getFormData: () => formData,
      resetForm: () =>
        setFormData({
          id: 0,
          name: "",
          code: "",
          role_level_id: undefined,
          description: "",
          privileges: [],
        }),
      setFormData: (data) =>
        setFormData((prev) => ({ ...prev, ...data })),
    }));

    return (
      <form autoComplete="off">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-4">
            <TextField
              label="Role Name *"
              name="name"
              size="small"
              value={formData.name}
              onChange={handleTextChange}
              fullWidth
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Role Level *</InputLabel>
              <Select
                label="Role Level"
                name="role_level_id"
                value={formData.role_level_id || ""}
                onChange={handleSelectChange}
              >
                {roleLevels.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Code"
              name="code"
              size="small"
              value={formData.code}
              onChange={handleTextChange}
              fullWidth
            />

            <TextField
              label="Description"
              name="description"
              multiline
              rows={3}
              size="small"
              value={formData.description}
              onChange={handleTextChange}
              fullWidth
            />
          </div>

          <div className="lg:col-span-3">
            <Paper className="p-4">
              <Box className="flex justify-between mb-3">
                <Typography fontWeight="bold">Privileges</Typography>

                <TextField
                  size="small"
                  placeholder="Filter privileges"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </Box>

              {loadingPrivileges ? (
                <CircularProgress size={18} />
              ) : (
                privilegesTree.map((node) => (
                  <PrivilegeTreeNode
                    key={node.id}
                    node={node}
                    selectedIds={selectedIds}
                    onToggle={handlePrivilegeToggle}
                    filterText={filterText}
                  />
                ))
              )}
            </Paper>
          </div>
        </div>
      </form>
    );
  }
);

export default RoleAddForm;