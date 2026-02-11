import { useEffect, useMemo, useRef, useState } from "react";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { Box, CircularProgress } from "@mui/material";

import { useLogs, useLogStatus } from "src/hooks/useLogs";
import Loader from "src/components/loader";
import { useSnackbar } from "src/provider/snackbar";
import { Table } from "src/components/ag-grid-react/table";

import "../../../App.css";
import "./logs-table.css";
import RefreshToken from "../../../assets/refresh.png";
// import { useWebsocket } from "src/hooks/useWebsocket";

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

export type LogMessage = {
  id: number;
  messageId: string;
  service: string;
  destination: string;
  status: "pending" | "sent" | "failed" | "processing";
  attempts: number;
  messageDate: string;
  type?: string;
};

const LogsTable = () => {
  const wValue = "100%";
  const hValue = "100%";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [data, setData] = useState<LogMessage[]>([]);

  //  {
  //     id: 12,
  //     messageId: "8beca3e3-5f8c-473c-9cd8-2df627552430",
  //     service: "slack",
  //     destination: "C0AAQJRGF6K",
  //     status: "pending",
  //     attempts: 0,
  //     messageDate: "2026-02-06T10:17:34.858Z",
  //   },

  // !!!! Do not remove for web socket!!
  // const token = localStorage.getItem("accessToken");
  // const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // const { sendMessage, status } = useWebsocket({
  //   url: `wss://${BASE_URL}/?clientId=GKMIT&token=` + token,
  //   // onMessage: (event: any) => {
  //   //   console.log("event", event);
  //   //   setData((prev: any) => {
  //   //     console.log("prev",prev)
  //   //     const existingIndex = prev.findIndex(
  //   //       (item: any) => item.id === 12, // event.id
  //   //     );
  //   //     console.log("existingIndex",existingIndex)
  //   //     if (existingIndex >= 0) {
  //   //       const updated = [...prev];
  //   //       console.log("spread op",updated)
  //   //       updated[existingIndex] = event;
  //   //       console.log("updated data",JSON.parse(updated))
  //   //       return updated;
  //   //     }
  //   //     return [...prev, event];
  //   //   });
  //   //   // setMessages((prev) => [...prev, event]);
  //   // },
  //   onMessage: (event: LogMessage) => {
  //     console.log("event..", event);
  //     if (event?.type === "stream") {
  //       setData((prev: LogMessage[]) => {
  //         console.log("prev", prev);
  //         const existingIndex = prev.findIndex((item) => item.id === event.id); // event.id
  //         console.log("existingIndex", existingIndex);

  //         if (existingIndex >= 0) {
  //           const updated = [...prev];
  //           updated[existingIndex] = event;
  //           return updated;
  //         }

  //         return [...prev, event];
  //       });
  //     }
  //   },
  // });

  // !!!! Do not remove for web socket!!

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  // const isTablet = window.matchMedia("(max-width: 1024px)").matches;

  const showSnackbar = useSnackbar();

  // console.log("final data", data);
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useLogs({ limit: pageSize, page });

  useEffect(() => {
    if (isError) {
      showSnackbar(error?.message || "Failed to fetch logs", "error");
      return;
    }

    // !!!! Do not remove for web socket!!

    // if (response?.data) {
    //   setData((prev) => {
    //     // keep websocket-updated rows if they exist
    //     const map = new Map(prev.map((item) => [item.id, item]));

    //     response.data.forEach((item: LogMessage) => {
    //       if (!map.has(item.id)) {
    //         map.set(item.id, item);
    //       }
    //     });

    //     return Array.from(map.values());
    //   });
    // }
  }, [isError, response?.data, error]);

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

  // const gridStyle = useMemo(() => ({ height: hValue, width: wValue }), []);

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
      pinned: isMobile ? undefined : "left",
      valueGetter: (params: any) => {
        if (params.node.rowIndex == null) return "";
        return params.node.rowIndex + 1;
      },
      filter: false,
    },
    {
      headerName: "Date and Time",
      field: "messageDate",
      filter: "agDateColumnFilter",
      tooltipField: "messageDate",

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
      flex: isMobile ? undefined : 1.5,
      minWidth: isMobile ? 180 : undefined,
    },
    {
      field: "service",
      headerName: "Service",
      flex: isMobile ? undefined : 1,
      filter: true,
      filterParams: {
        filterOptions: ["equals", "contains"],
      },
      tooltipField: "service",
    },
    {
      field: "destination",
      headerName: "Destination",
      flex: isMobile ? undefined : 1.5,
      minWidth: isMobile ? 160 : undefined,
      filter: true,
      filterParams: {
        filterOptions: ["contains", "equals"],
      },
      tooltipField: "destination",
    },
    {
      field: "status",
      headerName: "Status",
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 140 : undefined,
      filter: true,
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
      filterParams: {
        filterOptions: ["contains", "equals"],
      },
      tooltipField: "status",
    },
    {
      field: "attempts",
      headerName: "Attempts",
      flex: isMobile ? undefined : 0.5,
      minWidth: isMobile ? 50 : undefined,
      filter: true,
      cellStyle: { textAlign: "left" },
      filterParams: {
        filterOptions: ["contains", "equals"],
      },
      tooltipField: "attempts",
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

  // !!!! Do not remove for web socket!! // data ?? [];
  const logsData = response?.data ?? [];

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
    <Table
      isMobile={isMobile}
      isLoading={isLoading}
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      logsData={logsData}
      onPaginationChanged={onPaginationChanged}
      onFilterChanged={onFilterChanged}
      pageSize={pageSize}
      gridApiRef={gridApiRef}
      paginationPageSize={pageSize}
      paginationPageSizeSelector={[50, 75, 100]}
      shouldPaginate={true}
      enableBrowserTooltips={true}
    />
  );
};

export default LogsTable;
