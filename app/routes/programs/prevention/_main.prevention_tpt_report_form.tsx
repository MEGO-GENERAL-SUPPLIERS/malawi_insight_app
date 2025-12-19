import React, { Suspense, useRef, useState, useMemo, useEffect } from "react";
import { Tooltip, Box, CircularProgress } from "@mui/material";
import { PlusCircle, RefreshCw, Building, EyeIcon } from "lucide-react";
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { formattingUtils } from "~/utils/formattingUtils";

const PageHeaderTitle = React.lazy(() => import("~/components/system/PageHeaderTitle"));
const MenuCardsSkeletonLoader = React.lazy(() => import("~/components/system/skeletons/MenuCardsSkeletonLoader"));

import { ModalComponent, type ModalButton } from "~/components/system/ModalComponent";
import { fetchTptReportData } from "~/services/preventionService";
import TPTReportGridForm from "~/routes/programs/prevention/components/tb.tpt_report_grid_form";
import { AlertComponentController } from "~/components/controllers/AlertComponentController";
import type { TPTReportGridRef, ITPTReportData } from "~/types/interfaces/ITPTReportInterfaces";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { addTptReportData } from "~/services/preventionService";
import TptReportDataViewer from "~/routes/programs/prevention/components/tpt_report_data_viewer";

// Helper: Extract value from disaggregation data
const getValue = (
  data: ITPTReportData["data"],
  indicator: string,
  type: string,
  ageGroup: string
): number => {
  const row = data.find(d => d.indicator === indicator && d.type === type);
  return row?.values?.[ageGroup] ?? 0;
};

// Helper: Sum all age groups for an indicator + type
const getTotalFor = (
  data: ITPTReportData["data"],
  indicator: string,
  type: string
): number => {
  const row = data.find(d => d.indicator === indicator && d.type === type);
  return row ? Object.values(row.values).reduce((a, b) => a + b, 0) : 0;
};

// Helper: Get total stop reasons count
const getTotalStopReasons = (reasons: Record<string, number>): number => {
  return Object.values(reasons).reduce((sum, val) => sum + val, 0);
};

const PreventionTptReport: React.FC = () => {
  const modalRef = useRef<any>(null);
  const formRef = useRef<TPTReportGridRef>(null);

  const [tableData, setTableData] = useState<ITPTReportData[]>([]);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editRow, setEditRow] = useState<ITPTReportData | null>(null);
  const [formSlotData, setFormSlotData] = useState<any[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [localUser] = useState(() => localStorageUtils.getStoredUser());

  const detailsModalRef = useRef<any>(null);
  const [selectedReport, setSelectedReport] = useState<ITPTReportData | null>(null);

  const handleFetchTptReportData = async () => {
    setFetching(true);
    setLoading(true);
    try {
      const response = await fetchTptReportData();

      if (response.success && Array.isArray(response.data)) {
        setTableData(response.data);
        ToastAlertComponentController.show({
          type: "success",
          message: "TPT Report data refreshed successfully",
          icon: "CheckCircle",
          autoHideDuration: 2500,
        });
      } else {
        ToastAlertComponentController.show({
          type: "error",
          message: response.message || "Failed to refresh TPT Report Data",
          icon: "XCircle",
          autoHideDuration: 3500,
        });
      }
    } catch (err: any) {
      ToastAlertComponentController.show({
        type: "error",
        message: `Error refreshing TPT Report Data: ${err.message}`,
        icon: "XCircle",
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

  const handleModalOpen = () => {
    setCurrentStep(0);
    setEditRow(null);
    modalRef?.current.openModal();
  };

  const handleTptReportDetailsModalOpen = (report: ITPTReportData) => {
    setSelectedReport(report);
    detailsModalRef.current?.openModal();
  };

  const handleModalClose = () => {
    setCurrentStep(0);
    return true;
  };

  const handleModalFormClose = () => {
    AlertComponentController.show({
      title: "Confirm Close",
      message: `Are you sure you want to close the TPT Report Form? <p class="text-red-500 mt-2">All unsaved data will be lost.</p>`,
      icon: "HelpCircle",
      type: "warning",
      buttons: [
        {
          label: "Close Form",
          className: "btn btn-warning",
          onClick: () => {
            setCurrentStep(0);
            modalRef?.current.closeModal();
          },
        },
        {
          label: "Cancel",
          className: "btn btn-default",
          autoClose: true,
          onClick: () => {}
        },
      ],
    });
  };

  // ✅ Define meaningful columns
  const columns = useMemo<MRT_ColumnDef<ITPTReportData>[]>(() => [
    {
      accessorKey: "meta.facility.name",
      header: "Facility",
      Cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building size={16} className="text-gray-500" />
          <span>{row.original.meta.facility?.name}</span>
        </div>
      ),
      size: 200,
    },
    // {
    //   accessorKey: "meta.submitted_by",
    //   header: "Submitted By",
    //   Cell: ({ row }) => {
    //     const user = row.original.meta.submitted_by;
    //     return (
    //       <div className="flex items-center gap-2">
    //         <User size={16} className="text-gray-500" />
    //         <span>{`${user?.first_name} ${user?.last_name}`}</span>
    //       </div>
    //     );
    //   },
    //   size: 180,
    // },
    {
      accessorKey: "reportPeriod",
      header: "Report Period",
      Cell: ({ cell }) => formattingUtils.formatReportPeriodMMMYY(cell.getValue<string>()),
      size: 120,
    },
    {
      accessorKey: "txNewTotal",
      header: "TX New (Total)",
      Cell: ({ row }) => {
        const data = row.original.data;
        const total = ["M", "FP", "FNP"].reduce(
          (sum, type) => sum + getTotalFor(data, "Total number of clients new on ART (TX New)", type),
          0
        );
        return <strong>{total}</strong>;
      },
      size: 100,
    },
    // {
    //   accessorKey: "iptStartedTotal",
    //   header: "IPT Started",
    //   Cell: ({ row }) => {
    //     const data = row.original.data;
    //     const total = ["M", "FP", "FNP"].reduce(
    //       (sum, type) => sum + getTotalFor(data, "Number of clients new on ART started on IPT", type),
    //       0
    //     );
    //     return total;
    //   },
    //   size: 100,
    // },
    // {
    //   accessorKey: "threeHpStartedTotal",
    //   header: "3HP Started",
    //   Cell: ({ row }) => {
    //     const data = row.original.data;
    //     const total = ["M", "FP", "FNP"].reduce(
    //       (sum, type) => sum + getTotalFor(data, "Number of clients new on ART started on 3HP", type),
    //       0
    //     );
    //     return total;
    //   },
    //   size: 100,
    // },
    {
      accessorKey: "iptCompleted",
      header: "IPT Completed",
      Cell: ({ row }) => {
        const data = row.original.data;
        const total = ["M", "FP", "FNP"].reduce(
          (sum, type) =>
            sum +
            getTotalFor(
              data,
              "Number of clients who reached the six months milestone during the reporting month (IPT)",
              type
            ),
          0
        );
        return total;
      },
      size: 100,
    },
    {
      accessorKey: "threeHpCompleted",
      header: "3HP Completed",
      Cell: ({ row }) => {
        const data = row.original.data;
        const total = ["M", "FP", "FNP"].reduce(
          (sum, type) =>
            sum +
            getTotalFor(
              data,
              "Number of clients reached the three months milestone during the reporting month (3HP)",
              type
            ),
          0
        );
        return total;
      },
      size: 100,
    },
    {
      accessorKey: "iptStopped",
      header: "IPT Stopped",
      Cell: ({ row }) => getTotalStopReasons(row.original.ipt_stop_reasons),
      size: 90,
    },
    {
      accessorKey: "threeHpStopped",
      header: "3HP Stopped",
      Cell: ({ row }) => getTotalStopReasons(row.original.three_hp_stop_reasons),
      size: 90,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      Cell: ({ row }) => (
        <button
          onClick={() => {
            setEditRow(row.original);
            handleTptReportDetailsModalOpen(row.original);
          }}
          className="btn btn-info btn-sm text-sm"
        >
          <EyeIcon size={20}/>
        </button>
      ),
      size: 100,
      enableSorting: false,
    },
  ], []);

  const handleSubmit = () => {
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
          label: "Submit",
          className: "btn btn-success",
          onClick: async () => {
            setLoading(true);
            const formData = formRef.current!.getRows();
            const allData = {
              ...formData,
              meta: {
                ...formData?.meta,
                submitted_by: localUser,
              },
            };

            const response = await addTptReportData(allData);
            setLoading(false);

            if (response.success) {
              ToastAlertComponentController.show({
                type: "success",
                message: response.message || "TPT/IPT Report submitted successfully!",
                icon: "CheckCircle",
                autoHideDuration: 3500,
              });
              setCurrentStep(0);
              modalRef?.current?.closeModal();
              handleFetchTptReportData(); // Refresh table
            } else {
              ToastAlertComponentController.show({
                type: "error",
                message: response.message || "Failed to submit report",
                icon: "XCircle",
                autoHideDuration: 3500,
              });
            }
          },
        },
        { label: "Cancel", className: "btn btn-default", autoClose: true, onClick: () => {} },
      ],
    });
  };

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
        className: `btn ${editRow ? "btn-warning" : "btn-success"}`,
        onClick: handleSubmit,
      });
    }

    buttons.push({
      label: "Close",
      className: "btn btn-danger",
      onClick: handleModalFormClose,
    });

    return buttons;
  }, [currentStep, editRow, loading]);

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl ml-0">
        <Suspense fallback={<MenuCardsSkeletonLoader />}>
          <PageHeaderTitle
            icon="ClipboardCheck"
            title="TPT Monthly Reporting"
            description="Track and report TPT (IPT & 3HP) program indicators"
            alignment="left"
          />

          <div className="flex justify-between items-center mb-4">
            <Tooltip title="Add New TPT Report">
              <button onClick={handleModalOpen} className="btn btn-success flex gap-2 items-center">
                <PlusCircle size={18} />
                Add Report
              </button>
            </Tooltip>

            <Tooltip title="Refresh Reports">
              <button onClick={handleFetchTptReportData} className="btn btn-secondary">
                {fetching ? <CircularProgress color="inherit" size={18} /> : <RefreshCw size={18} />}
              </button>
            </Tooltip>
          </div>
        </Suspense>
      </div>

      <div className="mt-2">
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={24} />
          </Box>
        ) : (
          <MaterialReactTable
            columns={columns}
            data={tableData}
            initialState={{ density: "comfortable" }}
            enableColumnFilters={false}
            enableSorting={true}
            enablePagination={true}
            muiTablePaperProps={{ elevation: 2 }}
          />
        )}
      </div>

      <ModalComponent
        ref={modalRef}
        title={`${editRow ? "Edit" : "Add"} TPT Monthly Report - Step ${currentStep + 1}`}
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
          {loading && (
            <Box className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-md">
              <CircularProgress size={24} />
            </Box>
          )}
          <TPTReportGridForm
            ref={formRef}
            data={editRow}
            setSlotData={setFormSlotData}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        </div>
      </ModalComponent>

      {/*TPT Report Data*/}
      <ModalComponent
        ref={detailsModalRef}
        title="TPT Report Details"
        icon="FileText"
        size="full"
        blur={1}
        backdropOpacity={0.4}
        dismissable={true}
        showCloseButton={true}
        customButtons={[]}
        onClose={() => setSelectedReport(null)}
      >
        <TptReportDataViewer reportData={selectedReport} />
      </ModalComponent>

      <ToastAlertComponentController.render />
    </div>
  );
};

export default PreventionTptReport;