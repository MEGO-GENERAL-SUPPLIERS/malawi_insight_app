import React, { useMemo, useRef, useState, useEffect } from "react";
import { ModalComponent, type ModalButton } from "~/components/system/ModalComponent";
import DistrictAddForm from "~/components/forms/district.add";
import { type IDistrict } from "~/types/interfaces/IDistrictInterfaces";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { AlertComponentController } from "~/components/controllers/AlertComponentController";
import { addDistrict, updateDistrict, deleteDistrict, fetchDistricts } from '~/services/districtService';
import { CircularProgress, Box, Tooltip, useMediaQuery, TableContainer, Paper } from '@mui/material';
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
  const isMobile = useMediaQuery("(max-width:768px)");

  // fetch districts
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        setFetching(true);
        const response = await fetchDistricts();
        if (response.success && Array.isArray(response.data)) {
          setTableData(response.data);
        } else {
          ToastAlertComponentController.show({
            type: "error",
            icon: "XCircle",
            message: response.message || "Failed to load districts. Select country again",
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

    if (!data.name || !validationUtils.isAlphaNumericWithSpaces(data.name))
      errors.push(`District name must be a valid text.`);

    if (!data.code || !validationUtils.isAlphaNumericWithSpaces(data.code))
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
                const response = await fetchDistricts();
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

          <DistrictAddForm
            ref={formRef}
            initialData={
              editRow ? {
                id: editRow.id ?? 0,
                country_id: editRow.country_id ?? 0,
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

// import React, { useMemo, useRef, useState, useEffect } from "react";
// import { ModalComponent, type ModalButton } from "~/components/system/ModalComponent";
// import DistrictAddForm from "~/components/forms/district.add";
// import { type IDistrict } from "~/types/interfaces/IDistrictInterfaces";
// import { DataGrid, type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
// import { AlertComponentController } from "~/components/controllers/AlertComponentController";
// import { addDistrict, updateDistrict, deleteDistrict, fetchDistricts } from '~/services/districtService';
// import { CircularProgress, Box, Tooltip, useMediaQuery, TableContainer, Paper, IconButton } from '@mui/material';
// import { PlusCircle, RefreshCw, MapPin } from 'lucide-react';
// import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
// import { StaticAlertComponent } from "~/components/system/StaticAlertComponent";
// import { localStorageUtils } from "~/utils/localStorageUtils";
// import { validationUtils } from "~/utils/validationUtils";
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';

// const Districts: React.FC = () => {
//   const modalRef = useRef<any>(null);
//   const formRef = useRef<any>(null);
//   const [tableData, setTableData] = useState<IDistrict[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
//   const [errorMessage, setErrorMessage] = useState<string | string[] | null>(null);
//   const [editRow, setEditRow] = useState<IDistrict | null>(null);

//   // mobile detection
//   const isMobile = useMediaQuery("(max-width:768px)");

//   // column visibility model (controlled)
//   const [columnVisibilityModel, setColumnVisibilityModel] = useState<{ [key: string]: boolean }>({
//     // default: show all
//     index: true,
//     name: true,
//     code: true,
//     province_name: true,
//     void: true,
//     actions: true
//   });

//   // fetch districts
//   useEffect(() => {
//     const loadDistricts = async () => {
//       try {
//         setFetching(true);
//         const response = await fetchDistricts();
//         if (response.success && Array.isArray(response.data)) {
//           setTableData(response.data);
//         } else {
//           ToastAlertComponentController.show({
//             type: "error",
//             icon: "XCircle",
//             message: response.message || "Failed to load districts. Select country again",
//             autoHideDuration: 5500
//           });
//         }
//       } catch (error: any) {
//         ToastAlertComponentController.show({
//           type: "error",
//           icon: "XCircle",
//           message: `Error fetching districts: ${error.message}`,
//           autoHideDuration: 4500
//         });
//       } finally {
//         setFetching(false);
//       }
//     };

//     loadDistricts();
//   }, []);

//   // update column visibility when breakpoint changes
//   useEffect(() => {
//     if (isMobile) {
//       // on mobile hide some less-critical columns
//       setColumnVisibilityModel({
//         index: true,
//         name: true,
//         code: false,
//         province_name: false,
//         void: true,
//         actions: true
//       });
//     } else {
//       // desktop: show all
//       setColumnVisibilityModel({
//         index: true,
//         name: true,
//         code: true,
//         province_name: true,
//         void: true,
//         actions: true
//       });
//     }
//   }, [isMobile]);

//   const handleOpenModal = (row?: IDistrict) => {
//     setErrorMessage(null);
//     if (row) {
//       setEditRow(row);
//       formRef.current?.setFormData?.(row);
//     } else {
//       setEditRow(null);
//       formRef.current?.resetForm?.();
//     }
//     modalRef.current?.openModal();
//   };

//   const handleCloseModal = (fromModal: boolean = false) => {
//     setLoading(false);
//     setErrorMessage(null);
//     setEditRow(null);
//     if (!fromModal) modalRef.current?.closeModal();
//   };

//   const handleSubmit = async () => {
//     const data = formRef.current?.getFormData();
//     if (!data) return;

//     // validation
//     const errors: string[] = [];
//     if (!data.province_id || data.province_id === 0) errors.push(`Province must be set/selected.`);
//     if (!data.name || !validationUtils.isAlphaNumericWithSpaces(data.name)) errors.push(`District name must be a valid text.`);
//     if (!data.code || !validationUtils.isAlphaNumericWithSpaces(data.code)) errors.push(`District code must be a valid text.`);
//     if (errors.length > 0) {
//       setErrorMessage(errors);
//       return;
//     }

//     setErrorMessage(null);
//     const action = editRow ? "update" : "add";

//     AlertComponentController.show({
//       type: "confirm",
//       title: `Confirm`,
//       message: `Are you sure you want to ${action} district "${data.name}"?`,
//       buttons: [
//         {
//           label: `Proceed`,
//           className: `btn btn-success`,
//           onClick: async () => {
//             AlertComponentController.dismiss();
//             setLoading(true);

//             let response;
//             if (editRow) response = await updateDistrict(data);
//             else response = await addDistrict(data);

//             setLoading(false);

//             if (response.success && response.data) {
//               ToastAlertComponentController.show({
//                 type: `success`,
//                 message: `District "${data.name} ${editRow ? "updated" : "added"} successfully"`,
//                 icon: `CheckCircle`,
//                 autoHideDuration: 3500,
//                 animation: `slide`,
//                 slideDirection: `down`
//               });

//               if (editRow) {
//                 setTableData((prev) => prev.map((row: any) => (row.id === editRow.id ? response.data : row)));
//               } else {
//                 setTableData((prev: any) => [...prev, response.data]);
//               }

//               handleCloseModal();
//             } else {
//               setErrorMessage(response.message || `Failed to ${action} district`);
//             }
//           }
//         },
//         {
//           label: `Cancel`,
//           autoClose: true,
//           onClick: () => { },
//           className: 'btn btn-danger'
//         }
//       ]
//     });
//   };

//   const handleEditRow = (row: IDistrict) => handleOpenModal(row);

//   const handleDeleteRow = (row: IDistrict) => {
//     const appStorage = localStorageUtils.ensureLocalAppStructure();
//     const userId = appStorage.user?.id || "";

//     AlertComponentController.dismiss();
//     AlertComponentController.show({
//       type: `confirm`,
//       title: `Confirm Delete`,
//       message: `Are you sure you want to delete '${row.name}'`,
//       buttons: [
//         {
//           label: `Proceed`,
//           className: `btn btn-success`,
//           onClick: async () => {
//             const requestPayload = {
//               ...row,
//               void_by: userId,
//               void_reason: `administration`
//             };

//             const response = await deleteDistrict(requestPayload);

//             if (response.success) {
//               ToastAlertComponentController.show({
//                 type: `success`,
//                 message: `District '${row.name}' deleted successfully`,
//                 icon: `CheckCircle`,
//                 animation: `slide`,
//                 slideDirection: `down`,
//                 autoHideDuration: 3500
//               });

//               setTableData((prev) => prev.filter((r) => r.id !== row.id));
//             } else {
//               ToastAlertComponentController.show({
//                 type: `error`,
//                 message: `Failed to delete '${row.name}'.`,
//                 icon: `XCircle`,
//                 autoHideDuration: 3500
//               });
//             }
//           }
//         },
//         {
//           label: `Cancel`,
//           className: `btn btn-danger`,
//           autoClose: true,
//           onClick: () => { }
//         }
//       ]
//     });
//   };

//   // Columns for DataGrid
//   const columns = useMemo<GridColDef<IDistrict>[]>(() => [
//     {
//       field: "index",
//       headerName: "#",
//       width: 70,
//       sortable: false,
//       filterable: false,
//       // compute row index from api; safer than relying on any array index
//       valueGetter: (params: any) => {
//         // params.api.getRowIndex may be available; fallback: use params.row.__index if you precompute
//         // The DataGrid API method getRowIndex requires runtime API; we'll calculate using visible row index if possible:
//         // When not available, return 0 (table still works). In many setups valueGetter can't access api; alternative below:
//         return (params?.api.getRowIndex(params?.id) + 1);
//       }
//     },
//     { field: "name", headerName: "Name", flex: 1, minWidth: 140 },
//     { field: "code", headerName: "Code", width: 120 },
//     { field: "province_name", headerName: "Province", flex: 1, minWidth: 140 },
//     {
//       field: "void",
//       headerName: "Status",
//       width: 120,
//       sortable: true,
//       valueGetter: (params: any) => {
//         const value = params?.value as string | number | null;
//         return [0, null, ""].includes(value) ? "Active" : "Inactive";
//       }
//     },
//     {
//       field: "actions",
//       headerName: "Actions",
//       width: 120,
//       sortable: false,
//       filterable: false,
//       disableExport: true,
//       renderCell: (params: GridRenderCellParams<IDistrict>) => {
//         const row = params.row;
//         return (
//           <div className="flex gap-1">
//             <Tooltip title="Edit">
//               <IconButton
//                 size="small"
//                 onClick={() => handleEditRow(row)}
//                 aria-label={`edit-${row.id}`}
//               >
//                 <EditIcon fontSize="small" />
//               </IconButton>
//             </Tooltip>
//             <Tooltip title="Delete">
//               <IconButton
//                 size="small"
//                 onClick={() => handleDeleteRow(row)}
//                 aria-label={`delete-${row.id}`}
//               >
//                 <DeleteIcon fontSize="small" />
//               </IconButton>
//             </Tooltip>
//           </div>
//         );
//       }
//     }
//   ], []);

//   return (
//     <section className="space-y-4 p-4">
//       <h5 className="flex gap-2 text-lg font-semibold"><MapPin /> {"Districts"} </h5>

//       <div className="flex justify-between mb-2">
//         {/*Add District*/}
//         <Tooltip title="Add district">
//           <button
//             onClick={() => handleOpenModal()}
//             className="btn btn-success flex gap-2 items-center"
//           >
//             <PlusCircle />
//             <span>Add District</span>
//           </button>
//         </Tooltip>

//         {/*Refresh button*/}
//         <Tooltip title="Refresh districts data table">
//           <button
//             onClick={async () => {
//               setFetching(true);
//               try {
//                 const response = await fetchDistricts();
//                 if (response.success && Array.isArray(response.data)) {
//                   setTableData(response.data);
//                   ToastAlertComponentController.show({
//                     type: `success`,
//                     message: `Districts refreshed successfully`,
//                     icon: `CheckCircle`,
//                     autoHideDuration: 2500
//                   });
//                 } else {
//                   ToastAlertComponentController.show({
//                     type: `error`,
//                     message: response.message || `Failed to refresh districts`,
//                     icon: `XCircle`,
//                     autoHideDuration: 3500
//                   });
//                 }
//               } catch (err: any) {
//                 ToastAlertComponentController.show({
//                   type: `error`,
//                   message: `Error refreshing districts: ${err.message}`,
//                   icon: `XCircle`,
//                   autoHideDuration: 3500
//                 });
//               } finally {
//                 setFetching(false);
//               }
//             }}
//             className="btn btn-secondary flex items-center justify-center"
//           >
//             <RefreshCw size={20} />
//           </button>
//         </Tooltip>
//       </div>

//       {/* Loader and DataGrid */}
//       {fetching ? (
//         <Box className="flex justify-center items-center py-10">
//           <CircularProgress size={36} />
//         </Box>
//       ) : (
//         <TableContainer component={Paper}>
//           <div style={{ width: "100%" }}>
//             <DataGrid
//               autoHeight
//               rows={tableData}
//               columns={columns}
//               pageSizeOptions={[5, 10, 25]}
//               initialState={{
//                 pagination: { paginationModel: { pageSize: 10, page: 0 } }
//               }}
//               disableRowSelectionOnClick
//               getRowId={(row) => (row.id as any) } // ensure row id is correct
//               loading={loading}
//               columnVisibilityModel={columnVisibilityModel}
//               onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
//               sx={{
//                 // responsive typography & spacing
//                 ".MuiDataGrid-cell": {
//                   alignItems: "center"
//                 },
//                 // small tweaks for better mobile wrapping
//                 "& .MuiDataGrid-cellContent": {
//                   whiteSpace: "normal",
//                   overflow: "visible",
//                   lineHeight: "1.2"
//                 }
//               }}
//             />
//           </div>
//         </TableContainer>
//       )}

//       {isMobile && (
//         <Box display="grid" gap={2}>
//           {/* optional: mobile specific UI or hint */}
//           <small className="text-sm text-muted">Tip: rotate for more columns.</small>
//         </Box>
//       )}

//       {/* Modal */}
//       <ModalComponent
//         ref={modalRef}
//         title="District details"
//         icon="MapPin"
//         size="md"
//         blur={1}
//         backdropOpacity={0.4}
//         dismissable={false}
//         showCloseButton
//         customButtons={[{ label: editRow ? `Update` : `Submit`, className: `btn btn-success`, onClick: handleSubmit }]}
//         onClose={handleCloseModal}
//       >
//         <div>
//           <div className="relative">
//             {(loading || errorMessage) && (
//               <Box className="relative inset-0 flex flex-col justify-center items-center bg-white/90 z-10 gap-3 pt-2 pb-2 rounded-md">
//                 {loading && <div><CircularProgress size={24} /></div>}

//                 {/* Controlled StaticAlertComponent */}
//                 {errorMessage && (
//                   <StaticAlertComponent
//                     type="error"
//                     title="Error(s)"
//                     message={errorMessage}
//                     icon="AlertTriangle"
//                     dismissable
//                     onClose={() => setErrorMessage(null)}
//                   />
//                 )}
//               </Box>
//             )}
//           </div>

//           <DistrictAddForm
//             ref={formRef}
//             initialData={
//               editRow ? {
//                 id: editRow.id ?? 0,
//                 country_id: editRow.country_id ?? 0,
//                 province_id: editRow.province_id ?? 0,
//                 name: editRow.name ?? "",
//                 code: editRow.code ?? ""
//               } : undefined
//             }
//           />
//         </div>
//       </ModalComponent>

//       <ToastAlertComponentController.render />
//     </section>
//   );
// };

// export default Districts;
