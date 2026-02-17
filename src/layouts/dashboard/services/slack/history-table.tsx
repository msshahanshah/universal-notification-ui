import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { Box, CircularProgress, Typography } from "@mui/material";

import { useLogStatus } from "src/hooks/useLogs";
import Loader from "src/components/loader";
import { useSnackbar } from "src/provider/snackbar";

import "../../../../App.css";
import "../../logs/logs-table.css";
import "./history-table.css";
import RefreshToken from "../../../../assets/refresh.png";
import { Table } from "src/components/ag-grid-react/table";

export interface LogData {
  id: number;
  messageId: string;
  service: string;
  destination: string;
  message: string;
  status: "pending" | "active" | "failed" | "processing" | string;
  attempts: number;
  created_at?: string;
  updated_at?: string;
}

const HistoryTable = ({
  data,
  isDataLoading,
  isError,
  error,
}: {
  data: any;
  isDataLoading: boolean;
  isError: boolean;
  error: any;
}) => {
  const wValue = "100%";
  const hValue = "100%";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const showSnackbar = useSnackbar();

  useEffect(() => {
    if (isError) {
      showSnackbar(error?.message || "Failed to fetch logs", "error");
    }
  }, [isError]);

  const containerStyle = useMemo(
    () => ({
      width: wValue,
      height: hValue,
      marginTop: 15,
      boxShadow: `
      0 8px 24px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.04),
      0 0 20px rgba(0, 210, 255, 0.25)
    `,
      borderRadius: 8,
    }),
    [],
  );

  const gridStyle = useMemo(() => ({ height: hValue, width: wValue }), []);

  const gridApiRef = useRef<GridApi | null>(null);

  const StatusCell = ({ data, node }: any) => {
    const {
      data: statusData,
      refetch: refetchLogStatus,
      isLoading: isFetchingData,
      isError: isStatusError,
      error: isStatusErrorMessage,
    } = useLogStatus(data.messageId);

    const latestStatus = statusData?.data?.deliveryStatus ?? data.status;

    useEffect(() => {
      if (latestStatus && latestStatus !== data.status) {
        node.setDataValue("status", latestStatus);
      }
    }, [latestStatus, data.status, node]);

    useEffect(() => {
      if (isStatusError) {
        showSnackbar(
          isStatusErrorMessage?.message || "Failed to fetch status",
          "error",
        );
      }
    }, [isStatusError]);

    const handleRefresh = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!data.messageId) return; // Now it's okay because we're not using the return value
      refetchLogStatus();
    };

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div>
          {latestStatus.charAt(0).toUpperCase() + latestStatus.slice(1)}
        </div>

        <div onClick={handleRefresh}>
          {isFetchingData ? (
            <Loader size={14} color="white" />
          ) : (
            <img
              src={RefreshToken}
              width={16}
              height={16}
              alt="Refresh"
              style={{ display: "block", cursor: "pointer" }}
            />
          )}
        </div>
      </div>
    );
  };

  const [columnDefs] = useState<ColDef[]>([
    {
      headerName: "S.No",
      width: 80,
      pinned: "left",
      sortable: false,
      filter: false,

      valueGetter: (params: any) => {
        if (params.node.rowIndex == null) return "";
        return params.node.rowIndex + 1;
      },
    },
    {
      headerName: "Date and Time",
      field: "messageDate",
      filter: "agDateColumnFilter",

      valueFormatter: (params) =>
        params.value
          ? new Date(params.value).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true, // 👈 AM/PM
            })
          : "-",

      filterParams: {
        filterOptions: ["equals", "inRange"],
        suppressAndOrCondition: true,
        comparator: (filterDate: Date, cellValue: string) => {
          if (!cellValue) return -1;

          const cellDate = new Date(cellValue);

          // Normalize for exact matching
          const cellTime = cellDate.setMilliseconds(0);
          const filterTime = filterDate.setMilliseconds(0);

          if (cellTime === filterTime) return 0;
          return cellTime < filterTime ? -1 : 1;
        },
      },
      flex: 1.5,
    },
    {
      field: "destination",
      headerName: "Destination",
      flex: 1.5,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellStyle: (params): Record<string, string> => {
        const status = params.value?.toLowerCase();

        if (status === "sent") {
          return { color: "#04b34f", fontWeight: "500" };
        }
        if (status === "failed") {
          return { color: "#BB2124", fontWeight: "500" };
        }
        if (status === "pending") {
          return { color: "#FFC107", fontWeight: "500" };
        }
        if (status === "processing") {
          return { color: "#17a2b8", fontWeight: "500" };
        }
        return { color: "#666", fontWeight: "500" };
      },
      cellRenderer: StatusCell,
      valueFormatter: (params) => {
        if (params.value === undefined || params.value === null) return "-";
        return params.value.charAt(0).toUpperCase() + params.value.slice(1);
      },
    },
    {
      field: "attempts",
      headerName: "Attempts",
      flex: 0.5,
      type: "numericColumn",
      cellStyle: { textAlign: "left" },
    },
  ]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: !isMobile,
      floatingFilter: !isMobile,
      resizable: !isMobile,
      // suppressMenu: true,
      suppressMovable: true,

      // 🔑 CRITICAL
      wrapHeaderText: false,
      autoHeaderHeight: false,
      headerClass: "ag-header-mobile",
      cellClass: "ag-cell-mobile",
    }),
    [isMobile],
  );

  const logsData = data?.data ?? [];

  const onGridReady = (params: GridReadyEvent) => {
    gridApiRef.current = params.api;
  };

  const onPaginationChanged = () => {
    if (!gridApiRef.current) return;

    const newPage = gridApiRef.current.paginationGetCurrentPage() + 1;
    const newPageSize = gridApiRef.current.paginationGetPageSize();

    if (newPage !== page) setPage(newPage);

    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPage(1); // reset page on page size change
    }
  };

  const onFilterChanged = () => {
    if (!gridApiRef.current) return;

    const model = gridApiRef.current.getFilterModel();

    console.log("🧪 ACTIVE FILTER MODEL", model);
  };

  if (isDataLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Table
      isMobile={isMobile}
      isLoading={isDataLoading}
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      logsData={logsData}
      onPaginationChanged={onPaginationChanged}
      onFilterChanged={onFilterChanged}
      pageSize={pageSize}
      gridApiRef={gridApiRef}
      shouldPaginate={false}
    />
  );
};

export default HistoryTable;
