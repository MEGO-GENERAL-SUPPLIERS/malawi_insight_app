import React, { useMemo, useRef, useState, useEffect, Suspense } from "react";
import { ModalComponent, type ModalButton } from "~/components/system/ModalComponent";
import ProvinceAddForm from "~/components/forms/province.add";
import { type IProvince } from "~/types/interfaces/IProvinceInterfaces";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { AlertComponentController } from "~/components/controllers/AlertComponentController";
import { addProvince, updateProvince, deleteProvince, fetchProvinces } from "~/services/provinceService";
import { CircularProgress, Box, Tooltip } from "@mui/material";
import { PlusCircle, RefreshCw, Map } from "lucide-react";
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { validationUtils } from "~/utils/validationUtils";
import { StaticAlertComponent } from "~/components/system/StaticAlertComponent";
const DatatablePageSkeletonLoader = React.lazy(() => import("~/components/system/skeletons/DatatableSkeletonLoader"));

const Provinces = () => {
  const modalRef = useRef<any>(null);
  const formRef = useRef<any>(null);
  const [tableData, setTableData] = useState<IProvince[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | string[] | null>(null);
  const [editRow, setEditRow] = useState<IProvince | null>(null);

  // Fetch provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setFetching(true);
        const response = await fetchProvinces();
        if (response.success && Array.isArray(response.data)) {
          setTableData(response.data);
        } else {
          ToastAlertComponentController.show({
            type: "error",
            message: response.message || "Failed to load provinces",
            icon: "XCircle",
            autoHideDuration: 3500
          });
        }
      } catch (_error: any) {
        ToastAlertComponentController.show({
          type: "error",
          message: `Error fetching provinces: ${_error.message}`,
          icon: "XCircle",
          autoHideDuration: 3500
        });
      } finally {
        setFetching(false);
      }
    };

    loadProvinces();
  }, []);

  const handleOpenModal = (row?: IProvince) => {
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

  const handleCloseModal = (fromModal: boolean = false) => {
    setLoading(false);
    setErrorMessage(null);
    setEditRow(null);
    if (!fromModal) modalRef.current?.closeModal();
  };

  const handleSubmit = async () => {
    const data = formRef.current?.getFormData();
    if (!data) return;

    setErrorMessage(null);

    // -- Validation
    const errors: string[] = [];

    if(!data.country_id || data.country_id === 0) errors.push(`Country must be set/selected.`);

    if(!data.name || !validationUtils.isAlphaNumericWithSpaces(data.name)) errors.push(`Province name must be a valid text.`);

    if(!data.code || !validationUtils.isAlphaNumericWithSpaces(data.code)) errors.push(`Province code (short name) must be a valid text.`);

    if(errors.length > 0){
      setErrorMessage(errors);
      return;
    }

    setErrorMessage(null);
    const action = editRow ? "update" : "add";

    AlertComponentController.show({
      type: "confirm",
      title: `Confirm`,
      icon: `CircleQuestionMark`,
      message: `Are you sure you want to ${action} province "<strong>${data.name}</strong>"?`,
      buttons: [
        {
          label: "Proceed",
          onClick: async () => {
            AlertComponentController.dismiss();
            setLoading(true);

            let response;
            if (editRow) {
              response = await updateProvince(data);
            } else {
              response = await addProvince(data);
            }

            setLoading(false);

            if (response.success && response.data) {
              ToastAlertComponentController.show({
                type: "success",
                message: `Province "<strong>${data.name}</strong>" ${editRow ? "updated" : "added"} successfully!`,
                icon: "CheckCircle",
                autoHideDuration: 3500,
                animation: "slide",
                slideDirection: "down"
              });

              if (editRow) {
                setTableData((prev: any) =>
                  prev.map((row: any) => (row.id === editRow.id ? response.data : row))
                );
              } else {
                setTableData((prev: any) => [...prev, response.data]);
              }

              handleCloseModal();
            } else {
              setErrorMessage(response.message || `Failed to ${action} province`);
            }
          },
        },
        {
          label: "Cancel",
          autoClose: true,
          className: "btn btn-danger",
          onClick: () => {},
        },
      ],
    });
  };

  const handleEditRow = (row: IProvince) => handleOpenModal(row);

  const handleDeleteRow = (row: IProvince) => {
    // Get current user from localStorage
    const appStorage = localStorageUtils.ensureLocalAppStructure();
    const userId = appStorage.user?.id || "";

    AlertComponentController.dismiss();
    AlertComponentController.show({
      type: "confirm",
      title: "Confirm Delete",
      message: `Are you sure you want to delete "<strong>${row.name}</strong>"? <br />(This action will remove its associated children as well and it's irrevocable)`,
      buttons: [
        {
          label: "Proceed",
          className: "btn btn-success",
          onClick: async () => {
            const requestPayload = {
              ...row,
              void_by: userId,
              void_reason: "system administration",
            };

            const response = await deleteProvince(requestPayload);

            if (response.success) {
              ToastAlertComponentController.show({
                type: "success",
                message: `Province "${row.name}" deleted successfully!`,
                icon: "CheckCircle",
                animation: "slide",
                slideDirection: "down",
                autoHideDuration: 3500
              });

              setTableData((prev) => prev.filter((r) => r.id !== row.id));
            } else {
              ToastAlertComponentController.show({
                type: "error",
                message: `Failed to delete "${row.name}".`,
                icon: "XCircle",
                autoHideDuration: 3500
              });
            }
          },
        },
        {
          label: "Cancel",
          className: "btn btn-danger",
          autoClose: true,
          onClick: () => {},
        },
      ],
    });
  };

  const columns = useMemo<MRT_ColumnDef<IProvince>[]>(() => [
    { 
      accessorKey: "index", 
      header: "#", 
      muiTableHeadCellProps: { style: { color: "green" } },
      Cell: ({ row }) => row.index + 1,
      enableSorting: false,
      size: 70 
    },
    { accessorKey: "name", header: "Name", muiTableHeadCellProps: { style: { color: "green" } } },
    { accessorKey: "code", header: "Code", muiTableHeadCellProps: { style: { color: "green" } } },
    { accessorKey: "void", 
      header: "Status", 
      muiTableHeadCellProps: { style: { color: "green" } },
      Cell: ({ cell }) => {
        const value = cell.getValue() as string | number | null;
        return [0, null, ""].includes(value) ? "Active" : "Inactive";
      }
    },
    {
      id: "actions",
      header: "Actions",
      size: 150,
      enableColumnActions: false,
      enableSorting: false,
      position: "last",
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => handleEditRow(row.original)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRow(row.original)}>Delete</button>
        </div>
      ),
    },
  ], []);

  const customButtons: ModalButton[] = [
    { label: editRow ? "Update" : "Submit", className: "btn btn-success", onClick: handleSubmit },
  ];

  return (
    <section className="space-y-4 p-4">
      <h5 className="text-lg font-semibold flex gap-2"> <Map /> {"Provinces"}</h5>
      <Suspense fallback={<DatatablePageSkeletonLoader />}>
        <div className="flex justify-between mb-2">
          {/* Add Province button on the left */}
          <Tooltip title="Add Province">
            <button 
              onClick={() => handleOpenModal()} 
              className="btn btn-success flex gap-2 items-center"
            >
              <PlusCircle />
              <span>Add Province</span>
            </button>
          </Tooltip>

          {/* Refresh button on the far right */}
          <Tooltip title="Refresh provinces data table">
            <button
              onClick={async () => {
                setFetching(true);
                try {
                  const response = await fetchProvinces();
                  if (response.success && Array.isArray(response.data)) {
                    setTableData(response.data);
                    ToastAlertComponentController.show({
                      type: "success",
                      message: "Provinces refreshed successfully!",
                      icon: "CheckCircle",
                      autoHideDuration: 2500,
                    });
                  } else {
                    ToastAlertComponentController.show({
                      type: "error",
                      message: response.message || "Failed to refresh provinces",
                      icon: "XCircle",
                      autoHideDuration: 3500,
                    });
                  }
                } catch (err: any) {
                  ToastAlertComponentController.show({
                    type: "error",
                    message: `Error refreshing provinces: ${err.message}`,
                    icon: "XCircle",
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

        {fetching ? (
          <Box className="flex justify-center items-center py-10">
            <CircularProgress size={36} />
          </Box>
        ) : (
          <MaterialReactTable data={tableData} columns={columns} enableColumnActions />
        )}

        <ModalComponent
          ref={modalRef}
          title="Province Details"
          icon="MapPin"
          size="md"
          blur={1}
          backdropOpacity={0.4}
          dismissable={false}
          showCloseButton
          customButtons={customButtons}
          onClose={handleCloseModal}
        >
          <div>
            <div className="relative">
              {(loading || errorMessage) && (
                <Box className="relative inset-0 flex justify-center items-center bg-white/90 z-10 gap-3 pt-2 pb-4 mb-4 rounded-md">
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

              <ProvinceAddForm
                ref={formRef}
                initialData={
                  editRow
                    ? {
                        id: editRow.id ?? 0,
                        country_id: editRow.country_id ?? 1,
                        name: editRow.name ?? "",
                        code: editRow.code ?? "",
                      }
                    : undefined
                }
              />
          </div>
        </ModalComponent>

        <ToastAlertComponentController.render />
      </Suspense>  
    </section>
  );
};

export default Provinces;
