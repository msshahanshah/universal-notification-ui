import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { Box, CircularProgress, Typography } from "@mui/material";

import { useLogs, useLogStatus } from "src/hooks/useLogs";

import { myTheme } from "./constant";
import RefreshToken from "../../../assets/refresh.png";
// import Snackbar from "src/components/snackbar";
// import { useSnackbar } from "src/provider/snackbar";
import Loader from "src/components/loader";

import "../../../App.css";
import "./logs-table.css";

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

const LogsTable = () => {
  const wValue = "100%";
  const hValue = "100%";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

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

  // const showSnackbar = useSnackbar();
  const gridStyle = useMemo(() => ({ height: hValue, width: wValue }), []);

  const gridApiRef = useRef<GridApi | null>(null);

  const StatusCell = ({ data, node }: any) => {
    const {
      data: statusData,
      refetch: refetchLogStatus,
      isLoading: isFetchingData,
    } = useLogStatus(data.messageId);

    const latestStatus = statusData?.data?.deliveryStatus ?? data.status;

    useEffect(() => {
      if (latestStatus && latestStatus !== data.status) {
        node.setDataValue("status", latestStatus);
      }
    }, [latestStatus, data.status, node]);

    const handleRefresh = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!data.messageId) return; // Now it's okay because we're not using the return value
      refetchLogStatus();
    };

    // const showRefreshSnackbar = () => {
    //   if (!isFetchingData && statusData?.data?.deliveryStatus) {
    //     return showSnackbar("Status refreshed successfully!", "success");
    //   }
    //   return null;
    // };

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {/* <span>{showRefreshSnackbar() || null}</span> */}
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

  // const valueFormatter = (params: any) => {
  //   if (params.value === undefined || params.value === null) return "-";
  //   return params.value;
  // };

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
      headerName: "Created At",
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
      field: "service",
      headerName: "Service",
      flex: 1,
      filter: true,
      cellStyle: { textTransform: "capitalize" },
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
      filter: true,
      resizable: true,
      floatingFilter: true,
      suppressMenu: true,
      wrapHeaderText: true,
      autoHeaderHeight: true,
      suppressMovable: true,
    }),
    [],
  );

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useLogs({ limit: pageSize, page });

  const logsData = response?.data ?? [];
  const totalRows = response?.pagination?.limit ?? 0;

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

  if (isLoading) {
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
    <div style={containerStyle} className="ag-theme-quartz grid-12-font">
      <div style={{ ...gridStyle, minHeight: "500px" }}>
        <AgGridReact
          theme={myTheme}
          onGridReady={onGridReady}
          onPaginationChanged={onPaginationChanged}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={logsData}
          rowHeight={50}
          pagination={true}
          paginationPageSize={pageSize}
          paginationPageSizeSelector={[30, 60, 100, 200]}
          suppressPaginationPanel={false}
          animateRows
          headerHeight={50}
          enableCellTextSelection
          loading={isLoading}
          onFilterChanged={onFilterChanged}
        />
      </div>
    </div>
  );
};

export default LogsTable;
