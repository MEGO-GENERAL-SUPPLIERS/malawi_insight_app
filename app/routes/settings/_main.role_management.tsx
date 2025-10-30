import React, { useMemo, useRef, useState, useEffect } from "react";
import { ModalComponent, type ModalButton } from "~/components/system/ModalComponent";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { AlertComponentController } from "~/components/controllers/AlertComponentController";
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
import { StaticAlertComponent } from "~/components/system/StaticAlertComponent";
import { CircularProgress, Box, Tooltip, useMediaQuery, TableContainer, Paper } from "@mui/material";
import { PlusCircle, RefreshCwIcon, ShieldCheck } from "lucide-react";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { fetchRoles, addRole, updateRole, deleteRole } from "~/services/roleService";
import type { IRole } from "~/types/interfaces/IRoleInterfaces";
import RoleAddForm from "~/components/forms/role.add";
import { validationUtils } from "~/utils/validationUtils";

const Roles = () => {
  const modalRef = useRef<any>(null);
  const formRef = useRef<any>(null);
  const [tableData, setTableData] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | string[] | null>(null);
  const [editRow, setEditRow] = useState<IRole | null>(null);
  const isMobile = useMediaQuery("(max-width:768px)");

  const loadRoles = async (params: Record<string, any> = {}) => {
    try{
        setFetching(true);
        const response = await fetchRoles();
        if(response.success && Array.isArray(response.data)){
          setTableData(response.data);

          if(params.showToast){
            ToastAlertComponentController.show({
              type: "success",
              message: "Roles loaded successfully",
              icon: "CheckCircle",
              autoHideDuration: 2500,
            });
          }
        }else{
          ToastAlertComponentController.show({
            type: `error`,
            icon: `XCircle`,
            message: `${response.message || "Failed to load roles"}`,
            autoHideDuration: 4000
          });
        }
    }catch(e: any){
        ToastAlertComponentController.show({
        type: `error`,
        icon: `XCircle`,
        message: `Error fetching roles: ${e.message}`,
        autoHideDuration: 4000
        }); 
    } finally{
      setFetching(false);
    }
  };


  // Inial loa dof roles
  useEffect(() => {
    loadRoles();
  }, []);


  // Handle open modal
  const handleOpenModal = (row?: IRole) => {
    setErrorMessage(null);
    if(row){
      setEditRow(row);
      formRef.current?.setFormData?.(row);
    } else {
      setEditRow(null);
      formRef.current?.resetForm?.(row);
    }
    modalRef.current?.openModal();
  };


  // handle close modal
  const handleCloseModal = (fromModal: boolean = false) => {
    setLoading(false);
    setErrorMessage(null);
    setEditRow(null);
    if(!fromModal) modalRef.current?.closeModal();
  };


  // Handle submit
  const handleSubmit = async () => {
    const data = formRef.current?.getFormData();
    if(!data) return;

    const errors: string[] = [];
    
    if(!data.name || !validationUtils.isAlphaNumericWithSpaces(data.name))
        errors.push("Role name must be a valid text");

    if(!data.role_level_id)
      errors.push("Role level must be set/selected.");

    const duplicateCheck = tableData.find((r) => r.name.toLowerCase() === data.name.toLowerCase() && r.void === 0 && r.id !== editRow?.id);
    if(duplicateCheck) errors.push(`Role ${data.name} already exists.`);

    if(errors.length > 0){
      setErrorMessage(errors);
      return;
    }

    setErrorMessage(null);
    const action = editRow ? "update" : "add";

    AlertComponentController.show({
      type: `confirm`,
      title: `Confirm Submission`,
      message: `Are you sure you want to ${action} role ${data.name}?`,
      buttons: [
        {
          label: `Proceed`,
          className: `btn btn-success`,
          onClick: async () => {
            AlertComponentController.dismiss();
            setLoading(true);

            let response; 
            response = (editRow) ? await updateRole(data) : await addRole(data);

            setLoading(false);

            if(response.success && response.data){
              ToastAlertComponentController.show({
                type: `success`,
                message: `Role "${data.name}" ${editRow ? "updated" : "added" } successfully.`,
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
        },{
          label: `Cancel`,
          className: `btn btn-danger`,
          onClick: () => {},
          autoClose: true
        }
      ]
    });
  }; 


  // Handle Edit 
  const handleEditRow = (editRow: IRole) => handleOpenModal(editRow);


  // Handle delete
  const handleDeleteRow = (row: IRole) => {
    const appStorage = localStorageUtils.ensureLocalAppStructure();
    const userId = appStorage.user?.id || "";

    AlertComponentController.dismiss();
    AlertComponentController.show({
      type: `confirm`,
      title: `Confirm Delete`,
      icon: `TriangleAlert`,
      message: `Are you sure you want to delete "${row.name}" ?`,
      buttons: [
        {
          label: `Proceed`,
          className: `btn btn-success`,
          onClick: async ()=> {
            const response = await deleteRole({...row, void_by: userId, void_reason: "administration"});

            if(response.success){
              ToastAlertComponentController.show({
                type: `success`,
                message: `Role '${row.name}' deleted successfully`,
                icon: `CheckCircle`,
                animation: `slide`,
                slideDirection: `down`
              });
              
              setTableData((prev) => prev.filter((r) => r.id !== row.id ));
            } else {
              ToastAlertComponentController.show({
                type: `error`,
                message:  `Failed to delete '${row.name}'`,
                icon: `XCircle`
              });
            }
          }
        },
        {
          label: `Cancel`,
          className: `btn btn-danger`,
          autoClose: true,
          onClick: () => {}
        }
      ]
    });
  };


  // columns
  const columns = useMemo<MRT_ColumnDef<IRole>[]>(
    () => [
      {
        accessorKey: "index",
        header: "#",
        Cell: ({ row }) => row.index + 1,
        enableSorting: false,
        size: 70
      },
      {
        accessorKey: "name",
        header: "Role Name",
        muiTableHeadCellProps: { style: { color: "green" } }
      },
      {
        accessorKey: "role_level",
        header: "Role Level",
        muiTableHeadCellProps: { style: { color: "green" } },
        Cell: ({ cell }) => cell.getValue<string>() || "--"
      },
      { 
        accessorKey: "void",
        header: "Status",
        muiTableHeadCellProps: { style: { color: "green" } },
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          return [0, null, ""].includes(value as any) ? "Active" : "Inactive";
        } 
      },
      {
        id: "actions",
        header: "Actions",
        size: 60,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex gap-2">
            <Tooltip title="Edit role">
              <button className="btn btn-secondary btn-sm" onClick={() => handleEditRow(row.original)}>{"Edit"}</button>
            </Tooltip>
            <Tooltip title="Delete/Void Role">
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRow(row.original)}>{"Delete"}</button>
            </Tooltip>
          </div>
        )
      }
    ], []);

  return (
    <section className="space-y-4 p-4">
      <h5 className="flex gap-2 text-lg font-semibold"><ShieldCheck />{"Roles Management"}</h5>

      <div className="flex justify-between mb-2">
        <Tooltip title="Add Role">
          <button 
            onClick={() => handleOpenModal()}
            className="btn btn-success flex gap-2 items-center "
          >
            <PlusCircle />
            <span>{"Add Role"}</span>
          </button>
        </Tooltip>

        <Tooltip title="Refresh roles table">
          <button
            className="btn btn-secondary"
            onClick={ () => loadRoles({showToast: true}) }
          >
            <RefreshCwIcon size={20} />
          </button>
        </Tooltip>
      </div>

      
      {fetching ? (
          <Box className="flex justify-center items-center py-10">
            <CircularProgress size={32} />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <MaterialReactTable data={tableData} columns={columns} enableColumnActions />
          </TableContainer>
        )
      }


      <ModalComponent
        ref={modalRef}
        title="Role Details"
        icon="ShieldCheck"
        size="full"
        blur={1}
        backdropOpacity={0.4}
        dismissable={false}
        showCloseButton
        customButtons={
          [
            { label: editRow ? "Update" : "Submit", className: "btn btn-success", onClick: handleSubmit }
          ]
        }
      >
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

          <RoleAddForm ref={formRef} initialData={editRow ?? undefined } />
        </div>
      </ModalComponent>

      <ToastAlertComponentController.render />
    </section>
  )
};

export default Roles; 