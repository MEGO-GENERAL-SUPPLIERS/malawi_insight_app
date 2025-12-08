import React, { useEffect, useState, useMemo, Suspense } from "react";
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

const FacilityVisitorData: React.FC = () => {
  const [tableData, setTableData] = useState<IFacilityVisitFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | string[] | null>(null);
  const [editRow, setEditRow] = useState<IFacilityVisitFormData | null>(null);

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
        // Format as DD-MMM-YYYY (e.g., 04-Dec-2025)
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
        return facilities[0]?.name || "--"; // Safely get first facility's name
      },
    },
    {
      // NOTE: There is no 'logged_by' — use 'team_lead' instead
      accessorKey: "team_lead", // optional, but good for sorting/filtering if needed
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
              className="btn btn-secondary btn-sm"
              onClick={() => alert(JSON.stringify(row.original, null, 2))}
              >
              <EyeIcon />
            </button>
          </Tooltip>
          <Tooltip title="Void visit">
            <button
              className="btn btn-danger btn-sm"
              onClick={() => alert("Void this visit?")}
              >
              <DisabledVisible />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ], []);


  return(
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
            {/*Add Facility visit*/}
            <Tooltip title="Add facility visit">
              <button
                onClick={() => alert("Navigate to Add new facility visit")}
                className="btn btn-success flex gap-2 items-center"
              >
                <PlusCircle />
                <span>Add Facility Visit</span>
              </button>
            </Tooltip>

            {/*Refresh button*/}
            <Tooltip title="Refresh facility visit data table">
              <button
                onClick={loadFacilityVisitData}
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
          Facility Visit Data
        </Suspense>
      </div>
    </div>
  );
};

export default FacilityVisitorData;