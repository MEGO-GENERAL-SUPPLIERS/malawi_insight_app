import React, { useEffect, useState, useMemo, Suspense, useRef } from "react";
import { Tooltip, Box, TableContainer, CircularProgress, Paper } from "@mui/material";
import { EyeIcon, PlusCircle, RefreshCw } from "lucide-react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import type { IFacilityVisitFormData } from "~/types/interfaces/IFacilityVisit";
import { fetchFacilityVisitData } from "~/services/facilityVisitService";
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
const PageHeaderTitle = React.lazy(() => import("~/components/system/PageHeaderTitle"));
const DatatablePageSkeletonLoader = React.lazy(() => import("~/components/system/skeletons/DatatableSkeletonLoader"));
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { DisabledVisible } from "@mui/icons-material";
import { useNavigator } from "~/hooks/useNavigator";
import { ModalComponent } from "~/components/system/ModalComponent";
import FacilityVisitSummary from "~/routes/generic/components/facility_visit_summary";

const FacilityVisitorData: React.FC = () => {
  const modalRef = useRef<any>(null);
  const [tableData, setTableData] = useState<IFacilityVisitFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | string[] | null>(null);
  const [facilityDataDetails, setFacilityDataDetails] = useState<IFacilityVisitFormData | null>(null);
  const { navigateTo } = useNavigator();

  const loadFacilityVisitData = async () => {
    try {
      setFetching(true);
      const response = await fetchFacilityVisitData();
      if (response.success && Array.isArray(response.data)) {
        setTableData(response.data);
      } else {
        ToastAlertComponentController.show({
          type: "error",
          icon: "XCircle",
          message: response.message || "Failed to load facility visit data.",
          autoHideDuration: 5500
        });
      }
    } catch (error: any) {
      ToastAlertComponentController.show({
        type: "error",
        icon: "XCircle",
        message: `Error fetching facility visit data: ${error.message}`,
        autoHideDuration: 4500
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadFacilityVisitData();
  }, []);

  const columns = useMemo<MRT_ColumnDef<IFacilityVisitFormData>[]>(() => [
    {
      accessorKey: "index",
      header: "#",
      Cell: ({ row }) => row.index + 1,
      enableSorting: false,
      size: 70,
    },
    {
      accessorKey: "date_of_visit",
      header: "Visit Date",
      muiTableHeadCellProps: { style: { color: "green" } },
      Cell: ({ cell }) => {
        const dateStr = cell.getValue<string>();
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return format(date, "dd-MMM-yyyy", { locale: enUS });
      },
    },
    {
      accessorKey: "facility",
      header: "Facility Visited",
      muiTableHeadCellProps: { style: { color: "green" } },
      Cell: ({ row }) => {
        const facilities = row.original.facility;
        if (!Array.isArray(facilities) || facilities.length === 0) return "-";
        return facilities[0]?.name || "--";
      },
    },
    {
      accessorKey: "team_lead",
      header: "Visit Leader",
      muiTableHeadCellProps: { style: { color: "green" } },
      Cell: ({ row }) => row.original.team_lead || "--",
    },
    {
      id: "actions",
      header: "Actions",
      size: 120,
      enableColumnActions: false,
      enableSorting: false,
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <Tooltip title="View visit details">
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleModalOpen(row.original)}
            >
              <EyeIcon />
            </button>
          </Tooltip>
          <Tooltip title="Void visit">
            <button
              className="btn-sm bg-gray-300 cursor-not-allowed rounded-sm text-white"
              onClick={() => alert("Void this visit?")}
              disabled
            >
              <DisabledVisible />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ], []);

  const handleModalOpen = (row?: IFacilityVisitFormData) => {
    setErrorMessage(null);
    if (row) {
      setFacilityDataDetails(row);
    } else {
      setFacilityDataDetails(null);
    }
    modalRef?.current.openModal();
  };

  const handleModalClose = () => {
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl ml-0">
        <PageHeaderTitle
          icon="ClipboardList"
          title="Facility Visit Data"
          description="Facility Visit Data"
          alignment="left"
        />

        <Suspense fallback={<DatatablePageSkeletonLoader />}>
          <div className="flex justify-between mb-2">
            {/* Add Facility visit */}
            <Tooltip title="Add facility visit">
              <button
                onClick={() => navigateTo("generic_facility_visitor_add")}
                className="btn btn-success flex gap-2 items-center"
              >
                <PlusCircle />
                <span>Add Facility Visit</span>
              </button>
            </Tooltip>

            {/* Refresh button */}
            <Tooltip title="Refresh facility visit data table">
              <button
                onClick={loadFacilityVisitData}
                className="btn btn-secondary flex items-center justify-center"
              >
                <RefreshCw size={20} />
              </button>
            </Tooltip>
          </div>

          {/* Loader and datatable */}
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

          {/* Modal to view Facility Visit Details */}
          <ModalComponent
            ref={modalRef}
            title="Facility Visit Summary"
            icon="HospitalIcon"
            size="full"
            blur={1}
            backdropOpacity={0.4}
            dismissable={false}
            showCloseButton={true}
            customButtons={[]}
            onClose={handleModalClose}
          >
            <div className="max-h-[85vh] overflow-y-auto">
              <FacilityVisitSummary
                data={facilityDataDetails}
                errorMessage={errorMessage}
              />
            </div>
          </ModalComponent>
        </Suspense>
      </div>

      <ToastAlertComponentController.render />
    </div>
  );
};

export default FacilityVisitorData;