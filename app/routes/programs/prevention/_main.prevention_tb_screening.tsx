import React, { Suspense, useRef, useState, useMemo } from "react";
import { Tooltip, Box, CircularProgress } from "@mui/material";
import { PlusCircle, RefreshCw } from "lucide-react";
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
import { fetchTbScreeningData } from "~/services/programPreventionService";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import type { ITbScreeningData, ITbScreenRow, TbScreeningGridRef } from "~/types/interfaces/ITbScreeningDataInterfaces";
const PageHeaderTitle = React.lazy(() => import("~/components/system/PageHeaderTitle"));
const MenuCardsSkeletonLoader = React.lazy(() => import("~/components/system/skeletons/MenuCardsSkeletonLoader"));
import { ModalComponent, type ModalButton } from "~/components/system/ModalComponent";
import { StaticAlertComponent } from "~/components/system/StaticAlertComponent";
import TbScreeningGridForm from "~/components/forms/tb.screening.add";
import { AlertComponentController } from "~/components/controllers/AlertComponentController";
import { addTbScreeningData } from "~/services/preventionService";
import { localStorageUtils } from "~/utils/localStorageUtils";


const PreventionTbScreening: React.FC = () => {
  const modalRef = useRef<any>(null);
  const formRef = useRef<TbScreeningGridRef>(null);
  const [tableData, setTableData] = useState<ITbScreeningData[]>([]);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editRow, setEditRow] = useState<ITbScreeningData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | string[] | null>(null);
  const [formSlotData, setFormSlotData] = useState<ITbScreenRow[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [localUser, _setLocalUser] = useState(localStorageUtils.getStoredUser());

  
  // Handle Fetch TB Screening Data
  const handleFetchTbScreenData = async () => {
    setFetching(true);
    try {
      const response = await fetchTbScreeningData();
      if (response.success && Array.isArray(response.data)) {
        // setTableData(response.data);
        ToastAlertComponentController.show({
          type: `success`,
          message: `TB Screening data refreshed successfully`,
          icon: `CheckCircle`,
          autoHideDuration: 2500,
        });
      } else {
        ToastAlertComponentController.show({
          type: `error`,
          message: response.message || `Failed to refresh TB Screening Data`,
          icon: `XCircle`,
          autoHideDuration: 3500,
        });
      }
    } catch (err: any) {
      ToastAlertComponentController.show({
        type: `error`,
        message: `Error refreshing TB Screening Data: ${err.message}`,
        icon: `XCircle`,
        autoHideDuration: 3500,
      });
    } finally {
      setFetching(false);
    }
  }


  // handleModalOpen
  const handleModalOpen = () => {
    setCurrentStep(0); // Reset to first step when modal opens
    modalRef?.current.openModal();
  };


  // handleModalClose
  const handleModalClose = () => {
    setCurrentStep(0);
    return true;
  };


  // handleModalFormClose
  const handleModalFormClose = () => {
      AlertComponentController.show({
        title: `Confirm Close`,
        message: `Are you sure you want to close TB Screening data form? <p className="text-red-500">All captured/unsaved information will be lost</p>`,
        icon: "HelpCircle",
        type: "warning",
        buttons: [
          { 
            label: `Close Form`,
            className: `btn btn-warning`,
            onClick: async () => {
              setCurrentStep(0);
              modalRef?.current.closeModal();
            }
          }, 
          {
            label: `Cancel`,
            className: `btn btn-default`,
            autoClose: true,
            onClick: () => { }
          }
        ]
      });
  };

  // Columns 
  const columns = React.useMemo<MRT_ColumnDef<ITbScreeningData>[]>(
    () => [
      {
        accessorKey: "index",
        header: "#",
        Cell: ({ row }) => row.index + 1,
        enableSorting: false,
        size: 70
      }
    ],
  []);


  // handleSubmit
  const handleSubmit = () => {
    if (!formRef.current) return;


    if (currentStep < 1) {
      ToastAlertComponentController.show({
        type: "warning",
        message: "Please complete all sections before submitting.",
        icon: "AlertTriangle",
        autoHideDuration: 3000,
      });
      return;
    }

    // === CONFIRM SUBMISSION ===
    AlertComponentController.show({
      title: "Confirm Submission",
      message: "Are you sure you want to submit the TB Screening data?",
      icon: "HelpCircle",
      type: "success",
      buttons: [
        { 
          label: `Proceed`,
          className: `btn btn-success`,
          onClick: async () => {
            setLoading(true);

            const formData = formRef.current!.getRows();
            const allData = { 
              ...formData,
              meta: {
                ...formData?.meta,
                submitted_by: localUser
              }
            };

            console.log("TB Screening Data", allData);

            const response = await addTbScreeningData(allData);

            if(response?.success){
              ToastAlertComponentController.show({
                type: "success",
                message: `${ response.message || "TB Screening Data submitted successfully!"}`,
                icon: "CheckCircle",
                autoHideDuration: 3000,
              });

              modalRef?.current?.closeModal();

            } else {
              ToastAlertComponentController.show({
                type: "error",
                message: `${response.message || "Failed to submit TB Screening Data."}`,
                icon: "TriangleAlert",
                autoHideDuration: 2500,
              });
            }

            setLoading(false);
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



  // Handle step change
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  // Custom buttons that change based on current step
  const customButtons = useMemo(() => {
    const buttons: ModalButton[] = [];

    // Previous button (disabled on first step)
    if (currentStep > 0) {
      buttons.push({
        label: "Previous",
        className: "btn btn-secondary",
        onClick: () => setCurrentStep(prev => prev - 1)
      });
    }

    // Next button (only if not on last step)
    if (currentStep < 3) {
      buttons.push({
        label: "Next",
        className: "btn btn-primary",
        onClick: () => setCurrentStep(prev => prev + 1)
      });
    }

    // Submit button (only on last step)
    if (currentStep === 3) {
      buttons.push({ 
        label: editRow ? "Update" : "Submit", 
        icon: "Save",
        className: "btn btn-success", 
        onClick: handleSubmit
      });
    }

    // Always show Close button
    buttons.push({ 
      label: "Close", 
      className: "btn btn-danger", 
      onClick: handleModalFormClose 
    });

    return buttons;
  }, [currentStep, editRow]);



  return(
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl ml-0">
        <Suspense fallback={<MenuCardsSkeletonLoader />}>
          <PageHeaderTitle
            icon="Stethoscope"
            title="TB Screening"
            description="TB Screening"
            alignment="left"
          />
         
         {/* Add TB Screen Data*/}
          <div className="flex justify-between items-center mb-4">
            <Tooltip title="Add TB Screening Data">
              <button
                onClick={() => handleModalOpen()}
                className="btn btn-success flex gap-2 items-center"
              >
                <PlusCircle />
                <span>Add TB Screening Data</span>
              </button>
            </Tooltip>
  
            {/* Refresh Button (Right) */}
            <Tooltip title="Refresh TB Screeing data table">
              <button
                onClick={handleFetchTbScreenData}
                className="btn btn-secondary flex items-center justify-center"
              >
                <RefreshCw size={20} />
              </button>
            </Tooltip>
          </div>

          { /*Datatable*/ }

        </Suspense>
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

      {/*Modal*/}
      <ModalComponent
        ref={modalRef}
        title={`TB Screening Data - ${currentStep === 0 ? 'Section A' : 'Section B'}`}
        icon="Stethoscope"
        size="full"
        blur={1}
        backdropOpacity={0.4}
        dismissable={false}
        showCloseButton={false}
        customButtons={customButtons}
        onClose={handleModalClose}
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

          <TbScreeningGridForm 
            ref={formRef} 
            data={editRow?.data?.tb_screen_data} 
            setSlotData={(data: ITbScreenRow[]) => setFormSlotData(data)}
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />
        </div>
      </ModalComponent>

      <ToastAlertComponentController.render />
    </div>
  );
};

export default PreventionTbScreening;