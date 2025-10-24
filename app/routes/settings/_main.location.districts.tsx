import React, { useMemo, useRef, useState, useEffect } from "react";
import { ModalComponent, type ModalButton } from "~/components/system/ModalComponent";
import DistrictAddForm from "~/components/forms/district.add";
import { type IDistrict } from "~/types/interfaces/IDistrictInterdaces";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { AlertComponentController } from "~/components/controllers/AlertComponentController";
import { addDistrict, updateDistrict, deleteDistrict, fetchDistrict } from '~/services/districtService';
import { CircularProgress, Box, Tooltip } from '@mui/material';
import { PlusCircle, RefreshCw, MapPin } from 'lucide-react';
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
import { StaticAlertComponent } from "~/components/system/StaticAlertComponent";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { validationUtils } from "~/utils/validationUtils";

const Districts = () => {
  const modalRef = useRef<any>(null);
  const formRef = useRef<any>(null);
  const [tableData, setTableData] = useState<IDistrict[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | string[] | null>(null);
  const [editRow, setEditRow] = useState<IDistrict | null>(null);

  // fetch districts
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        setFetching(true);
        const response = await fetchDistrict();
        if (response.success && Array.isArray(response.data)) {
          setTableData(response.data);
        } else {
          ToastAlertComponentController.show({
            type: "error",
            icon: "XCircle",
            message: response.message || "Failed to load districts",
            autoHideDuration: 3500
          });
        }
      } catch (error: any) {
        ToastAlertComponentController.show({
          type: "error",
          icon: "XCircle",
          message: `Error fetching districts: ${error.message}`,
          autoHideDuration: 3500
        });
      } finally {
        setFetching(false);
      }
    };

    loadDistricts();
  }, []);

  const handleOpenModal = (row?: IDistrict) => {
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

    if (!data.province_id || data.province_id === 0)
      errors.push(`Province must be set/selected.`);

    if (!data.name || !validationUtils.isAlphaNumeric(data.name))
      errors.push(`District name must be a valid text.`);

    if (!data.code || !validationUtils.isAlphaNumeric(data.code))
      errors.push(`District code must be a valid text.`);

    if (errors.length > 0) {
      setErrorMessage(errors);
      return;
    }

    setErrorMessage(null);
    const action = editRow ? "update" : "add";

    AlertComponentController.show({
      type: "confirm",
      title: `Confirm`,
      message: `Are you sure you want to ${action} district "${data.name}"?`,
      buttons: [
        {
          label: `Proceed`,
          className: `btn btn-success`,
          onClick: async () => {
            AlertComponentController.dismiss();
            setLoading(true);

            let response;
            if (editRow) {
              response = await updateDistrict(data);
            } else {
              response = await addDistrict(data);
            }

            setLoading(false);

            if (response.success && response.data) {
              ToastAlertComponentController.show({
                type: `success`,
                message: `District "${data.name} ${editRow ? "updated" : "added"} successfully"`,
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
              setErrorMessage(response.message || `Failed to ${action} district`);
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

  const handleEditRow = (row: IDistrict) => handleOpenModal(row);

  const handleDeleteRow = (row: IDistrict) => {
    const appStorage = localStorageUtils.ensureLocalAppStructure();
    const userId = appStorage.user?.id || "";

    AlertComponentController.dismiss();
    AlertComponentController.show({
      type: `confirm`,
      title: `Confirm Delete`,
      message: `Are you sure you want to delete '${row.name}'`,
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

            const response = await deleteDistrict(requestPayload);

            if (response.success) {
              ToastAlertComponentController.show({
                type: `success`,
                message: `District '${row.name}' deleted successfully`,
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

  const columns = useMemo<MRT_ColumnDef<IDistrict>[]>(() => [
    { accessorKey: `name`, header: `Name`, muiTableHeadCellProps: { style: { color: "green" } } },
    { accessorKey: `code`, header: `Code`, muiTableHeadCellProps: { style: { color: "green" } } },
    { accessorKey: `province_name`, header: `Province`, muiTableHeadCellProps: { style: { color: "green" } } },
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
      <h5 className="flex gap-2 text-lg font-semibold"><MapPin /> {"Districts"} </h5>

      <div className="flex justify-between mb-2">
        {/*Add District*/}
        <Tooltip title="Add district">
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-success flex gap-2 items-center"
          >
            <PlusCircle />
            <span>Add District</span>
          </button>
        </Tooltip>

        {/*Refresh button*/}
        <Tooltip title="Refresh districts data table">
          <button
            onClick={async () => {
              setFetching(true);
              try {
                const response = await fetchDistrict();
                if (response.success && Array.isArray(response.data)) {
                  setTableData(response.data);
                  ToastAlertComponentController.show({
                    type: `success`,
                    message: `Districts refreshed successfully`,
                    icon: `CheckCircle`,
                    autoHideDuration: 2500
                  });
                } else {
                  ToastAlertComponentController.show({
                    type: `error`,
                    message: response.message || `Failed to refresh districts`,
                    icon: `XCircle`,
                    autoHideDuration: 3500
                  });
                }
              } catch (err: any) {
                ToastAlertComponentController.show({
                  type: `error`,
                  message: `Error refreshing districts: ${err.message}`,
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
        <MaterialReactTable data={tableData} columns={columns} enableColumnActions />
      )}

      {/*Modal*/}
      <ModalComponent
        ref={modalRef}
        title="District details"
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
              <Box className="relative inset-0 flex flex-col justify-center items-center bg-white/90 z-10 gap-3 pt-2 pb-2 rounded-md">
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

          <DistrictAddForm
            ref={formRef}
            initialData={
              editRow ? {
                id: editRow.id ?? 0,
                province_id: editRow.province_id ?? 0,
                name: editRow.name ?? "",
                code: editRow.code ?? ""
              } : undefined
            }
          />
        </div>
      </ModalComponent>

      <ToastAlertComponentController.render />
    </section>
  );
};

export default Districts;
