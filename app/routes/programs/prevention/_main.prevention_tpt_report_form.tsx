import React, { Suspense, useRef, useState, useMemo, useEffect } from "react";
import { Tooltip, Box, CircularProgress, LinearProgress } from "@mui/material";
import { PlusCircle, RefreshCw } from "lucide-react";
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

const PageHeaderTitle = React.lazy(() => import("~/components/system/PageHeaderTitle"));
const MenuCardsSkeletonLoader = React.lazy(() => import("~/components/system/skeletons/MenuCardsSkeletonLoader"));

import { ModalComponent, type ModalButton } from "~/components/system/ModalComponent";
import { StaticAlertComponent } from "~/components/system/StaticAlertComponent";
import { fetchTptReportData } from "~/services/preventionService";
import TPTReportGridForm from "~/components/forms/tb.tpt_report_grid_form"; 
import { AlertComponentController } from "~/components/controllers/AlertComponentController";
import type { TPTReportGridRef, ITPTReportData, ITPTGridRow } from "~/types/interfaces/ITPTReportInterfaces";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { addTPTReportData } from "~/services/preventionService";
import { ConstructionOutlined } from "@mui/icons-material";

const PreventionTptReport: React.FC = () => {
  const modalRef = useRef<any>(null);
  const formRef = useRef<TPTReportGridRef>(null);

  const [tableData, setTableData] = useState<ITPTReportData[]>([]);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editRow, setEditRow] = useState<ITPTReportData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | string[] | null>(null);
  const [formSlotData, setFormSlotData] = useState<ITPTGridRow[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [localUser, _setLocalUser] = useState(localStorageUtils.getStoredUser());

  // Fetch TPT Report Data (placeholder using TB fetch)
  const handleFetchTptReportData = async () => {
    setFetching(true);
    setLoading(true);
    try {
      const response = await fetchTptReportData(); // Replace with TPT service later

      if (response.success && Array.isArray(response.data)) {
        ToastAlertComponentController.show({
          type: `success`,
          message: `TPT Report data refreshed successfully`,
          icon: `CheckCircle`,
          autoHideDuration: 2500,
        });
      } else {
        ToastAlertComponentController.show({
          type: `error`,
          message: response.message || `Failed to refresh TPT Report Data`,
          icon: `XCircle`,
          autoHideDuration: 3500,
        });
      }
    } catch (err: any) {
      ToastAlertComponentController.show({
        type: `error`,
        message: `Error refreshing TPT Report Data: ${err.message}`,
        icon: `XCircle`,
        autoHideDuration: 3500,
      });
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };


  useEffect(() => {
    handleFetchTptReportData();
  }, []);

  // Open modal
  const handleModalOpen = () => {
    setCurrentStep(0);
    modalRef?.current.openModal();
  };

  const handleModalClose = () => {
    setCurrentStep(0);
    return true;
  };

  const handleModalFormClose = () => {
    AlertComponentController.show({
      title: `Confirm Close`,
      message: `Are you sure you want to close the TPT Report Form? <p className="text-red-500 mt-6">All captured/unsaved/unsubmitted data will be lost</p>`,
      icon: "HelpCircle",
      type: "warning",
      buttons: [
        {
          label: `Close Form`,
          className: `btn btn-warning`,
          onClick: () => {
            setCurrentStep(0);
            modalRef?.current.closeModal();
          },
        },
        {
          label: `Cancel`,
          className: `btn btn-default`,
          autoClose: true,
          onClick: () => {}
        },
      ],
    });
  };

  // Table Columns
  const columns = useMemo<MRT_ColumnDef<ITPTReportData>[]>(
    () => [
      {
        accessorKey: "index",
        header: "#",
        Cell: ({ row }) => row.index + 1,
        enableSorting: false,
        size: 70,
      },
    ],
    []
  );

  // Submit
  const handleSubmit = () => {
    console.log("Form submit");

    if (!formRef.current) return;

    if (currentStep < 3) {
      ToastAlertComponentController.show({
        type: "warning",
        message: "Please complete all sections before submitting.",
        icon: "AlertTriangle",
        autoHideDuration: 3000,
      });
      return;
    }

    AlertComponentController.show({
      title: "Confirm Submission",
      message: "Are you sure you want to submit the TPT Monthly Report?",
      icon: "HelpCircle",
      type: "success",
      buttons: [
        {
          label: `Submit`,
          className: `btn btn-success`,
          onClick: async () => {
            setLoading(true);

            const formData = formRef.current!.getRows();
            const allData = { 
              ...formData,
              meta: {
                ...formData?.meta,
                user_id: localUser?.id
              }
            };

            console.log("TPT Report Data", allData);

            const response = await addTPTReportData(allData);

            if(response.success){
              ToastAlertComponentController.show({
                type: "success",
                message: `${ response.message || "TPT Monthly Report Data summitted successfully!"}`,
                icon: "CheckCircle",
                autoHideDuration: 3000,
              });
            } else {
              ToastAlertComponentController.show({
                type: "error",
                message: `${ response.message || "Failed to submit TPT Report Data"}`,
                icon: "TriangleAlert",
                autoHideDuration: 3000,
              });
            }

            setLoading(false);
            modalRef?.current?.closeModal();
          },
        },
        {
          label: `Cancel`,
          className: `btn btn-danger`,
          autoClose: true,
          onClick: () => {}
        },
      ],
    });
  };

  // Steps Button Logic
  const customButtons = useMemo(() => {
    const buttons: ModalButton[] = [];

    if (currentStep > 0) {
      buttons.push({
        label: "Previous",
        className: "btn btn-secondary",
        onClick: () => setCurrentStep((prev) => prev - 1),
      });
    }

    if (currentStep < 3) {
      buttons.push({
        label: "Next",
        className: "btn btn-primary",
        onClick: () => setCurrentStep((prev) => prev + 1),
      });
    }

    if (currentStep === 3) {
      buttons.push({
        label: editRow ? "Update Report" : "Submit Report",
        icon: "Save",
        className: "btn btn-success",
        onClick: handleSubmit,
      });
    }

    buttons.push({
      label: "Close",
      className: "btn btn-danger",
      onClick: handleModalFormClose,
    });

    return buttons;
  }, [currentStep, editRow]);

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl ml-0">
        <Suspense fallback={<MenuCardsSkeletonLoader />}>
          <PageHeaderTitle
            icon="ClipboardCheck"
            title="TPT Monthly Reporting"
            description="TPT Monthly Reporting Form"
            alignment="left"
          />

          {/* Add Button */}
          <div className="flex justify-between items-center mb-4">
            <Tooltip title="Add TPT Monthly Report">
              <button
                onClick={handleModalOpen}
                className="btn btn-success flex gap-2 items-center"
              >
                <PlusCircle />
                <span>Add TPT Report</span>
              </button>
            </Tooltip>

            {/* Refresh */}
            <Tooltip title="Refresh TPT Reports">
              <button
                onClick={handleFetchTptReportData}
                className="btn btn-secondary flex items-center justify-center"
              >
                { (loading || fetching) ? <CircularProgress color="inherit" size={18} /> : <RefreshCw size={19} /> }
              </button>
            </Tooltip>
          </div>
        </Suspense>
      </div>

      {/* Table */}
      <div>
        {loading ? (
          <Box className="flex justify-center items-center h-64">
            <CircularProgress size={22} />
          </Box>
        ) : (
          <MaterialReactTable columns={columns} data={tableData} />
        )}
      </div>

      {/* Modal */}
      <ModalComponent
        ref={modalRef}
        title={`TPT Monthly Report - Step ${currentStep + 1}`}
        icon="Pill"
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

          <TPTReportGridForm
            ref={formRef}
            data={editRow ?? null}
            setSlotData={(data: ITPTGridRow[] | null) => setFormSlotData(data)}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        </div>
      </ModalComponent>

      <ToastAlertComponentController.render />
    </div>
  );
};

export default PreventionTptReport;
