import React, { useMemo, useRef, useState, useEffect, Suspense } from "react";
import { ModalComponent, type ModalButton } from "~/components/system/ModalComponent";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { AlertComponentController } from "~/components/controllers/AlertComponentController";
import { CircularProgress, Box, Tooltip, useMediaQuery, TableContainer, Paper } from '@mui/material';
import { PlusCircle, RefreshCw, HospitalIcon } from 'lucide-react';
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
import { StaticAlertComponent } from "~/components/system/StaticAlertComponent";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { validationUtils } from "~/utils/validationUtils";
import { addFacility, fetchFacilities, updateFacility, deleteFacility } from "~/services/facilityService";
import type { IFacility } from "~/types/interfaces/IFacilityInterfaces";
const FacilityAddForm = React.lazy(() => import("~/components/forms/facility.add"));
const DatatablePageSkeletonLoader = React.lazy(() => import("~/components/system/skeletons/DatatableSkeletonLoader"));

const Facilities = () => {
  const modalRef = useRef<any>(null);
  const formRef = useRef<any>(null);
  const [tableData, setTableData] = useState<IFacility[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | string[] | null>(null);
  const [editRow, setEditRow] = useState<IFacility | null>(null);
  const isMobile = useMediaQuery("(max-width:768px)");

  // fetch districts
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setFetching(true);
        const response = await fetchFacilities();
        if (response.success && Array.isArray(response.data)) {
          setTableData(response.data);
        } else {
          ToastAlertComponentController.show({
            type: "error",
            icon: "XCircle",
            message: response.message || "Failed to load facilities. Select province again",
            autoHideDuration: 5500
          });
        }
      } catch (error: any) {
        ToastAlertComponentController.show({
          type: "error",
          icon: "XCircle",
          message: `Error fetching districts: ${error.message}`,
          autoHideDuration: 4500
        });
      } finally {
        setFetching(false);
      }
    };

    loadFacilities();
  }, []);

  const handleOpenModal = (row?: IFacility) => {
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

    // -- Validation
    const errors: string[] = [];
    if (!data.country_id || data.country_id === 0)
      errors.push(`Country must be set/selected.`);

    if (!data.province_id || data.province_id === 0)
      errors.push(`Province must be set/selected. (Select country first)`);

    if (!data.district_id || data.district_id === 0)
      errors.push(`District must be set/selected. (Select province first)`);

    if (!data.name || !validationUtils.isValidInput(data.name))
      errors.push(`Facility name must be a valid text.`);

    if (!data.code || !validationUtils.isAlphaNumericWithSpaces(data.code))
      errors.push(`Faiclity code must be a valid text.`);

    if (errors.length > 0) {
      setErrorMessage(errors);
      return;
    }

    setErrorMessage(null);
    const action = editRow ? "update" : "add";
    
    AlertComponentController.dismiss();
    AlertComponentController.show({
      type: "confirm",
      title: `Confirm`,
      message: `Are you sure you want to ${action} facility "<strong>${data.name}</strong>"?`,
      buttons: [
        {
          label: `Proceed`,
          className: `btn btn-success`,
          onClick: async () => {
            AlertComponentController.dismiss();
            setLoading(true);

            let response;
            if (editRow) {
              response = await updateFacility(data);
            } else {
              response = await addFacility(data);
            }

            setLoading(false);

            if (response.success && response.data) {
              ToastAlertComponentController.show({
                type: `success`,
                message: `Facility "${data.name}" ${editRow ? "updated" : "added"} successfully`,
                icon: `CheckCircle`,
                autoHideDuration: 3500,
                animation: `slide`,
                slideDirection: `down`
              });

              if (editRow) {
                setTableData((prev) =>
                  prev.map((row: any) => (row.id === editRow.id ? response.data : row))
                );
              } else {
                setTableData((prev: any) => [...prev, response.data]);
              }

              handleCloseModal();
            } else {
              setErrorMessage(response.message || `Failed to ${action} facility`);
            }
          }
        },
        {
          label: `Cancel`,
          autoClose: true,
          onClick: () => { },
          className: 'btn btn-danger'
        }
      ]
    });
  };

  const handleEditRow = (row: IFacility) => handleOpenModal(row);

  const handleDeleteRow = (row: IFacility) => {
    const appStorage = localStorageUtils.ensureLocalAppStructure();
    const userId = appStorage.user?.id || "";

    AlertComponentController.dismiss();
    AlertComponentController.show({
      type: `confirm`,
      title: `Confirm Delete`,
      message: `Are you sure you want to delete "<strong>${row.name}</strong>"`,
      buttons: [
        {
          label: `Proceed`,
          className: `btn btn-success`,
          onClick: async () => {
            const requestPayload = {
              ...row,
              void_by: userId,
              void_reason: `administration`
            };

            const response = await deleteFacility(requestPayload);

            if (response.success) {
              ToastAlertComponentController.show({
                type: `success`,
                message: `Facility '${row.name}' deleted successfully`,
                icon: `CheckCircle`,
                animation: `slide`,
                slideDirection: `down`,
                autoHideDuration: 3500
              });

              setTableData((prev) => prev.filter((r) => r.id !== row.id));
            } else {
              ToastAlertComponentController.show({
                type: `error`,
                message: `Failed to delete '${row.name}'.`,
                icon: `XCircle`,
                autoHideDuration: 3500
              });
            }
          }
        },
        {
          label: `Cancel`,
          className: `btn btn-danger`,
          autoClose: true,
          onClick: () => { }
        }
      ]
    });
  };

  const columns = useMemo<MRT_ColumnDef<IFacility>[]>(() => [
    {
      accessorKey: "index", // virtual column
      header: "#",
      Cell: ({ row }) => row.index + 1, // 0-based index → add 1
      enableSorting: false,           // usually no need to sort
      size: 70,                       // optional: fixed width
    },
    { accessorKey: `name`, header: `Name`, muiTableHeadCellProps: { style: { color: "green" } } },
    { accessorKey: `code`, header: `Code`, muiTableHeadCellProps: { style: { color: "green" } } },
    { 
      accessorKey: `district_name`, 
      header: `District`, 
      muiTableHeadCellProps: { style: { color: "green" } },
      Cell: ({ cell }) => cell.getValue<string>() || "--",
    },
    { 
      accessorKey: `province_name`, 
      header: `Province`, 
      muiTableHeadCellProps: { style: { color: "green" } },
      Cell: ({ cell }) => cell.getValue<string>() || "--",
    },
    {
      accessorKey: `void`,
      header: `Status`,
      muiTableHeadCellProps: { style: { color: `green` } },
      Cell: ({ cell }) => {
        const value = cell.getValue() as string | number | null;
        return [0, null, ""].includes(value) ? `Active` : `Inactive`;
      }
    },
    {
      id: 'actions',
      header: "Actions",
      size: 60,
      enableColumnActions: false,
      enableSorting: false,
      position: "last",
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => handleEditRow(row.original)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRow(row.original)}>Delete</button>
        </div>
      )
    }
  ], []);

  const customModalButtons: ModalButton[] = [
    { label: editRow ? `Update` : `Submit`, className: `btn btn-success`, onClick: handleSubmit }
  ];

  return (
    <section className="space-y-4 p-4">
      <h5 className="flex gap-2 text-lg font-semibold"><HospitalIcon /> {"Facilities"} </h5>

      <Suspense fallback={<DatatablePageSkeletonLoader />}>
        <div className="flex justify-between mb-2">
          {/*Add District*/}
          <Tooltip title="Add Facility">
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-success flex gap-2 items-center"
            >
              <PlusCircle />
              <span>Add Facility</span>
            </button>
          </Tooltip>

          {/*Refresh button*/}
          <Tooltip title="Refresh facilities data table">
            <button
              onClick={async () => {
                setFetching(true);
                try {
                  const response = await fetchFacilities();
                  if (response.success && Array.isArray(response.data)) {
                    setTableData(response.data);
                    ToastAlertComponentController.show({
                      type: `success`,
                      message: `Facilities refreshed successfully`,
                      icon: `CheckCircle`,
                      autoHideDuration: 2500
                    });
                  } else {
                    ToastAlertComponentController.show({
                      type: `error`,
                      message: response.message || `Failed to refresh facilities`,
                      icon: `XCircle`,
                      autoHideDuration: 3500
                    });
                  }
                } catch (err: any) {
                  ToastAlertComponentController.show({
                    type: `error`,
                    message: `Error refreshing facilities: ${err.message}`,
                    icon: `XCircle`,
                    autoHideDuration: 3500
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

        {/*Loader and datatable*/}
        {fetching ? (
          <Box className="flex justify-center items-center py-10">
            <CircularProgress size={36} />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <MaterialReactTable 
              data={tableData} 
              columns={columns} 
              enableColumnActions={true}
              />
          </TableContainer>
        )}

        {(isMobile) && 
          (
            <Box display="grid" gap={2}>
              Moible
            </Box>
          )
        }

        {/*Modal*/}
        <ModalComponent
          ref={modalRef}
          title="Facility details"
          icon="MapPin"
          size="md"
          blur={1}
          backdropOpacity={0.4}
          dismissable={false}
          showCloseButton
          customButtons={customModalButtons}
          onClose={handleCloseModal}
        >
          <div>
            <div className="relative">
              {(loading || errorMessage) && (
                <Box className="relative inset-0 flex flex-col justify-center items-center bg-white/90 z-10 gap-3 pt-2 pb-2 mb-4 rounded-md">
                  {loading && <div><CircularProgress size={24} /></div>}

                  {/* Controlled StaticAlertComponent */}
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

            <FacilityAddForm
              ref={formRef}
              initialData={
                editRow ? {
                  id: editRow.id ?? 0,
                  country_id: editRow.country_id ?? 0,
                  province_id: editRow.province_id ?? 0,
                  district_id: editRow.district_id ?? 0,
                  name: editRow.name ?? "",
                  code: editRow.code ?? ""
                } : undefined
              }
            />
          </div>
        </ModalComponent>

        <ToastAlertComponentController.render />
      </Suspense>
    </section>
  );
};

export default Facilities;