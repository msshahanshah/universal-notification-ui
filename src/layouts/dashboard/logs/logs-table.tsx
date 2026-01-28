import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { Box, CircularProgress, Typography } from "@mui/material";

import { useLogs, useLogStatus } from "src/hooks/useLogs";

import { myTheme } from "./constant";
import RefreshToken from "../../../assets/refresh.png";
import Snackbar from "src/components/snackbar";
import { useSnackbar } from "src/provider/snackbar";
import Loader from "src/components/loader";

import "../../../App.css";

export interface LogData {
  id: number;
  messageId: string;
  service: string;
  destination: string;
  message: string;
  status: "pending" | "active" | "failed" | string;
  attempts: number;
  created_at?: string;
  updated_at?: string;
}

const LogsTable = () => {
  const wValue = "100%";
  const hValue = "100%";
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

  const showSnackbar = useSnackbar();
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

    useEffect(() => {
      if (!gridApiRef.current) return;

      if (isLoading) {
        gridApiRef.current.showLoadingOverlay();
        return;
      }

      if (isError) {
        gridApiRef.current?.setGridOption(
          "overlayNoRowsTemplate",
          `<span style="color:#d32f2f;font-size:14px;">
    ${error?.message || "Something went wrong"}
  </span>`,
        );

        gridApiRef.current?.showNoRowsOverlay();

        return;
      }

      if (!logsData?.data || logsData.data.length === 0) {
        gridApiRef.current?.setGridOption(
          "overlayNoRowsTemplate",
          `<span style="color:#666;font-size:14px;">
    No logs available
  </span>`,
        );

        gridApiRef.current?.showNoRowsOverlay();
        return;
      }

      gridApiRef.current.hideOverlay();
    }, [isLoading, isError, logsData, error]);

    const handleRefresh = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!data.messageId) return; // Now it's okay because we're not using the return value
      refetchLogStatus();
    };

    const showRefreshSnackbar = () => {
      if (!isFetchingData && statusData?.data?.deliveryStatus) {
        return showSnackbar("Status refreshed successfully!", "success");
      }
      return null;
    };

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

  const valueFormatter = (params: any) => {
    if (params.value === undefined || params.value === null) return "-";
    return params.value;
  };

  const [columnDefs] = useState<ColDef[]>([
    {
      field: "messageDate",
      headerName: "Time",
      flex: 1.5,

      filter: "agTextColumnFilter",

      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleString("en-GB") : "-",

      filterValueGetter: (params) =>
        params.data?.messageDate
          ? new Date(params.data.messageDate).toLocaleString("en-GB")
          : "",

      filterParams: {
        debounceMs: 200,
      },
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
      cellStyle: { textAlign: "left", minWidth: 100 },
    },
  ]);

  const getFilteredRows = () => {
    const filteredRows: LogData[] = [];

    gridApiRef.current?.forEachNodeAfterFilter((node) => {
      if (node.data) {
        filteredRows.push(node.data);
      }
    });
  };

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

  const { data: response, isLoading, isError, error } = useLogs({ limit: 100 });

  const logsData = response || [];

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
    <div style={containerStyle} className="ag-theme-quartz">
      <div style={{ ...gridStyle, minHeight: "500px" }}>
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={logsData?.data as LogData[]}
          rowHeight={50}
          pagination={true}
          paginationPageSizeSelector={[10, 25, 50, 100]}
          theme={myTheme}
          animateRows
          suppressCellFocus={false}
          headerHeight={50}
          enableCellTextSelection={true}
          ensureDomOrder={true}
        />
      </div>
    </div>
  );
};

export default LogsTable;
