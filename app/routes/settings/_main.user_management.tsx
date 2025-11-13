import React, { Suspense, useRef, useState, useEffect } from "react";
import PageHeaderTitle from "~/components/system/PageHeaderTitle";
import {
  ModalComponent,
  type ModalButton,
} from "~/components/system/ModalComponent";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
import { CircularProgress, Box, Tooltip, IconButton } from "@mui/material";
import { PlusCircle, RefreshCw, Pencil, Trash2Icon } from "lucide-react";
import { fetchUsers, addUser, updateUser, deleteUser } from "~/services/userService";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { AlertComponentController } from "~/components/controllers/AlertComponentController";
import { validationUtils } from "~/utils/validationUtils";
import { StaticAlertComponent } from "~/components/system/StaticAlertComponent";
import type { IUser } from "~/types/interfaces/IUserInterfaces";

// Lazy loaders
const DatatableSkeletonLoader = React.lazy(
  () => import("~/components/system/skeletons/DatatableSkeletonLoader")
);
const UserAdd = React.lazy(() => import("~/components/forms/user.add")); // 👈 Your Add/Edit Form Component

const Users: React.FC = () => {
  const modalRef = useRef<any>(null);
  const formRef = useRef<any>(null);

  const [tableData, setTableData] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | string[] | null>(
    null
  );
  const [_fetching, setFetching] = useState(false);
  const [editRow, setEditRow] = useState<IUser | null>(null);

  /* Fetch Data */
    useEffect(() => {
      const loadUsers = async () => {
        try {
          setFetching(true);
          const response = await fetchUsers();
          if (response.success && Array.isArray(response.data)) {
            setTableData(response.data);
          } else {
            ToastAlertComponentController.show({
              type: "error",
              icon: "XCircle",
              message: response.message || "Failed to load users.",
              autoHideDuration: 5500
            });
          }
        } catch (error: any) {
          ToastAlertComponentController.show({
            type: "error",
            icon: "XCircle",
            message: `Error fetching users: ${error.message}`,
            autoHideDuration: 4500
          });
        } finally {
          setFetching(false);
        }
      };
  
      loadUsers();
    }, []);

  /* Modal Handlers */
  const handleOpenModal = (row?: IUser) => {
    setErrorMessage(null);
    if (row) {
      setEditRow(row);
      formRef.current?.setFormData?.(row);
    } else {
      setEditRow(null);
      formRef.current?.resetForm?.();
    }
    modalRef.current?.openModal();
  };

  const openEditModal = (row: IUser) => {
    setEditRow(row);
    modalRef.current?.openModal();
  };

  const handleDelete = (row: IUser) => {
    const localStg = localStorageUtils.ensureLocalAppStructure();
    const localUser = localStg?.user; 

    AlertComponentController.dismiss();
    AlertComponentController.show({
      type: `confirm`,
      title: `Confirm Delete`,
      message: `Are you sure you want to delete/void ${row.first_name} ${row.other_names || ""} ${row.last_name} account? <br /><span className="text-red-500">(This action is irrevocable)!</span>`,
      buttons: [
        {
          label: `Proceed`,
          className: `btn btn-success`,
          onClick: async () => {
            const response = await deleteUser({...row, void_by: localUser?.id, void_reason: "system administration"});

            if(response.success){
              ToastAlertComponentController.show({
                type: `success`,
                message: `${row.first_name} ${row.other_names || ""} ${row.last_name}'s account deleted successfully`,
                icon: `CheckCircle`,
                animation: `slide`,
                slideDirection: `down`
              });
              
              setTableData((prev) => prev.filter((r) => r.id !== row.id ));
            } else {
              ToastAlertComponentController.show({
                type: `error`,
                message:  `Failed to delete ${row.first_name} ${row.other_names || ""} ${row.last_name}'s`,
                icon: `XCircle`
              });
            }
          }  
        },
        {
          label: `Cancel`,
          className: `btn btn-danger`,
          autoClose: true,
          onClick: ()=> {}
        }
      ]
    });
  }

  const handleCloseModal = () => {
    modalRef.current?.closeModal();
  };

  /* Table Columns*/
  const columns = React.useMemo<MRT_ColumnDef<IUser>[]>(
    () => [
      {
        accessorKey: "index",
        header: "#",
        Cell: ({ row }) => row.index + 1,
        enableSorting: false,
        size: 70
      },
      {
        accessorFn: (row) =>
          `${row.first_name} ${row.other_names || ""} ${row.last_name}`,
        header: "Full Name",
      },
      {
        accessorKey: "username",
        header: "Username",
      },
      {
        accessorFn: (row) => row.role_level?.name || "-",
        header: "Role Level",
      },
      {
        accessorFn: (row) => row.roles?.map((r) => r.name).join(", ") || "-",
        header: "Roles",
      },
      {
        id: "actions",
        header: "Actions",
        Cell: ({ row }) => {

          return (<div className="flex gap-2">
            <Tooltip title="Edit User">
              <button
                onClick={() => openEditModal(row.original)}
                className="btn btn-sm btn-default"
              >
                <Pencil size={16} />
              </button>
            </Tooltip>

            <Tooltip title="Delete/Void User">
              <button
                onClick={() => handleDelete(row.original)}
                className="text-red-500 btn btn-sm btn-danger"
              >
                <Trash2Icon size={16} />
              </button>
            </Tooltip>
          </div>);
        },
      },
    ],
    []
  );

  const handleSubmit = async () => {
    const data = formRef.current.getFormData();
    if (!data) return;

    const errors: string[] = [];

    if (!data.first_name || !validationUtils.isValidInput(data.first_name))
      errors.push("First name is required.");

    if (!data.last_name || !validationUtils.isValidInput(data.last_name))
      errors.push("Last name is required.");

    if (!data.gender || data.gender.id <= 0)
      errors.push("Gender is required.");

    if(data.contacts){
      if (data.contacts.length > 0) {
        data.contacts.forEach((contact: any, index: number) => {
          if (!contact.contact || !validationUtils.isValidInput(contact.contact) || contact.contact_type == null) {
            errors.push(`Contact #${index + 1} is invalid.`);
          }
        });
      } else {
        errors.push("At least one contact is required.");
      }
    }

    if (!data.role_level || data.role_level.id <= 0)
      errors.push("Role level is required.");

    // Locations validations based on role level
    if (!data.locations || data.locations.countries.length === 0)
      errors.push("Country is required.");

    if (["province", "district", "facility", "hq"].includes(data.role_level?.name?.toLowerCase())) {
      if (!data.locations.provinces || data.locations.provinces.length === 0)
        errors.push("At least one province is required.");
    }

    if (["district", "facility"].includes(data.role_level?.name?.toLowerCase())) {
      if (!data.locations.districts || data.locations.districts.length === 0)
        errors.push("At least one district is required.");
    }

    if (data.role_level?.name?.toLowerCase() === "facility") {
      if (!data.locations.facilities || data.locations.facilities.length === 0)
        errors.push("At least one facility is required.");
    }

    if (["hq", "province", "district", "facility"].includes(data.role_level?.name?.toLowerCase())) {
      if (!data.roles || data.roles.length === 0)
        errors.push("At least one role must be selected.");
    }

    if(!data.username || !validationUtils.isStringWithoutSpaces(data.username))
      errors.push("Username is required");

    if (errors.length > 0) {
      setErrorMessage(errors);
      return;
    }

    // If no errors, proceed with submission
    setErrorMessage(null);
    const action = editRow ? "update" : "add";
    const appStorage = localStorageUtils.ensureLocalAppStructure();
    const user = appStorage.user || {};
        
    AlertComponentController.dismiss();
    AlertComponentController.show({
      type: `confirm`,
      title: `Confirm Submission`,
      message: `Are you sure you want to ${action == "update" ? `apply these updates to the ` : "add the"} user account of "<strong>${data.first_name} ${data.other_names} ${data.last_name}</strong>"?`,
      buttons: [
        {
          label: `Proceed`,
          className: `btn btn-success`,
          onClick: async () => {

            AlertComponentController.dismiss();
            setLoading(true);

            data.creator = { ...data.creator, user_id: user?.id, user_role: user?.roles }; // add creator

            let response; 
            response = (editRow) ? await updateUser(data) : await addUser(data);

            setLoading(false);

            if(response.success && response.data){
              const fullname = `${data.first_name} ${data.other_names} ${data.last_name}`;
              ToastAlertComponentController.show({
                type: `success`,
                message: `User "${fullname}" ${editRow ? "updated" : "added" } successfully.`,
                icon: `CheckCircle`,
                animation: `slide`,
                slideDirection: `down`
              });

              if(editRow){
                setTableData((prev) => 
                  prev.map((row: any) => (row.id === editRow.id ? response.data : row))
                );
              }else{
                setTableData((prev: any) => [...prev, response.data]);
              }

              handleCloseModal();
            } else{
              setErrorMessage(response.message || `Failed to ${action} role.`);
            } 
          } 
        },
        {
          label: `Cancel`,
          className: `btn btn-danger`,
          onClick: () => {},
          autoClose: true
        }
      ]
    });
  };


  return (
    <section>
      <Suspense fallback={<DatatableSkeletonLoader />}>
        <PageHeaderTitle
          title="User Management"
          icon="Users"
          description="Manage user accounts and roles"
          alignment="left"
        />

        <div className="flex justify-between items-center mb-4">
          {/* Add Facility Button (Left) */}
          <Tooltip title="Add User">
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-success flex gap-2 items-center"
            >
              <PlusCircle />
              <span>Add User</span>
            </button>
          </Tooltip>

          {/* Refresh Button (Right) */}
          <Tooltip title="Refresh users data table">
            <button
              onClick={async () => {
                setFetching(true);
                try {
                  const response = await fetchUsers();
                  if (response.success && Array.isArray(response.data)) {
                    setTableData(response.data);
                    ToastAlertComponentController.show({
                      type: `success`,
                      message: `Users refreshed successfully`,
                      icon: `CheckCircle`,
                      autoHideDuration: 2500,
                    });
                  } else {
                    ToastAlertComponentController.show({
                      type: `error`,
                      message: response.message || `Failed to refresh users`,
                      icon: `XCircle`,
                      autoHideDuration: 3500,
                    });
                  }
                } catch (err: any) {
                  ToastAlertComponentController.show({
                    type: `error`,
                    message: `Error refreshing u: ${err.message}`,
                    icon: `XCircle`,
                    autoHideDuration: 3500,
                  });
                } finally {
                  setFetching(false);
                }
              }}
              className="btn btn-secondary flex items-center justify-center"
            >
              <RefreshCw size={20} />
            </button>
          </Tooltip>
        </div>

        <div>
          {loading ? (
            <Box className="flex justify-center items-center h-64">
              <CircularProgress />
            </Box>
          ) : (
            <MaterialReactTable columns={columns} data={tableData} />
          )}
        </div>


        {/* Modal: Add / Edit User */}
        <ModalComponent
          ref={modalRef}
          title={editRow ? "Edit User" : "Add New User"}
          size="full"
          customButtons={
            [
              { label: editRow ? "Update" : "Submit", className: "btn btn-success", onClick: handleSubmit }
            ] as ModalButton[]
          }
        >
          <Suspense fallback={<Box className="p-10 text-center"><CircularProgress /></Box>}>
            <div className="relative">
              {(loading || errorMessage) && (
                <Box className="relative inset-0 flex flex-col justify-center items-center bg-white/90 z-10 gap-3 pt-2 pb-2 mb-4 rounded-md">
                  {loading && <CircularProgress size={24} />}
                  {errorMessage && (
                    <StaticAlertComponent
                      type="error"
                      title="Error(s)"
                      message={errorMessage}
                      icon="AlertTriangle"
                      dismissable
                      onClose={() => setErrorMessage(null)}
                    />
                  )}
                </Box>
              )}
            </div>
            <UserAdd
              ref={formRef}
              user={editRow ?? undefined}
            />
          </Suspense>
        </ModalComponent>

        <ToastAlertComponentController.render />
      </Suspense>
    </section>
  );
};

export default Users;
