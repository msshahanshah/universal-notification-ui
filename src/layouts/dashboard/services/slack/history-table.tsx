import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { Box, CircularProgress, Typography } from "@mui/material";

import { useSnackbar } from "src/provider/snackbar";
import Loader from "src/components/loader";
import { useLogStatus } from "src/hooks/useLogs";
import "../../../../App.css";
import "../../logs/logs-table.css";

import RefreshToken from "../../../../assets/refresh.png";
import { myTheme } from "../../logs/constant";

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
      isError: isStatusError,
      error: isStatusErrorMessage,
    } = useLogStatus(data.messageId);

    useEffect(() => {
      if (isStatusError) {
        showSnackbar(
          isStatusErrorMessage?.message || "Failed to fetch status",
          "error",
        );
      }
    }, [isStatusError]);

    const latestStatus = statusData?.data?.deliveryStatus ?? data.status;

    useEffect(() => {
      if (latestStatus && latestStatus !== data.status) {
        node.setDataValue("status", latestStatus);
      }
    }, [latestStatus, data.status, node]);

    useEffect(() => {
      if (!gridApiRef.current) return;

      if (isDataLoading) {
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

      if (!data?.data || data.data.length === 0) {
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
    }, [isDataLoading, isError, data, error]);

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

  const [columnDefs] = useState<ColDef[]>([
    {
      field: "messageDate",
      headerName: "Date and Time",
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
      cellStyle: { textAlign: "left", minWidth: 100 },
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

  const logsData = data || [];

  return (
    <div style={containerStyle} className="ag-theme-quartz grid-12-font">
      <div style={{ ...gridStyle, minHeight: "300px" }}>
        <AgGridReact
          enableCellTextSelection={true}
          ensureDomOrder={true}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={logsData?.data as LogData[]}
          rowHeight={50}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10]}
          theme={myTheme}
          animateRows
          suppressCellFocus={false}
          headerHeight={40}
        />
      </div>
    </div>
  );
};

export default HistoryTable;
