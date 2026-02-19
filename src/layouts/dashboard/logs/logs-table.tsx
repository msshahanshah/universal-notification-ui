import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { Box, CircularProgress } from "@mui/material";

import { useLogs, useLogStatus } from "src/hooks/useLogs";
import Loader from "src/components/loader";
import { useSnackbar } from "src/provider/snackbar";
import { Table } from "src/components/ag-grid-react/table";

import "../../../App.css";
import "./logs-table.css";
import RefreshToken from "../../../assets/refresh.png";

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
  const [page, setPage] = useState(2);
  const [pageSize, setPageSize] = useState(5);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortModel, setSortModel] = useState<string>("");

  const paginationPageSizeSelector = useMemo(() => {
    return [50, 75, 100];
  }, []);
  const paginationNumberFormatter = useCallback((params) => {
    return "[" + params.value.toLocaleString() + "]";
  }, []);

  console.log("sortModel", sortModel);
  const [data, setData] = useState<LogMessage[]>([]);

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const showSnackbar = useSnackbar();

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useLogs({ limit: pageSize, page, ...filters });
  // , sort: sortModel

  useEffect(() => {
    if (isError) {
      showSnackbar(error?.message || "Failed to fetch logs", "error");
      return;
    }
  }, [isError, response?.data, error]);

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

  const buildFilterParams = (model: any) => {
    const params: Record<string, any> = {};

    Object.entries(model).forEach(([field, value]: any) => {
      if (!value?.filter) return;

      // Multi-select (set filter)
      if (value.values) {
        params[field] = value.values.join(",");
      } else {
        params[field] = value.filter;
      }
    });

    return params;
  };

  const CustomTooltip = (props: any) => {
    const data = props.api.getDisplayedRowAtIndex(props.rowIndex)?.data;

    console.log("data", data);
    if (!data) return null;
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "white",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        <div>
          <strong>To:</strong> {data.destination || "N/A"}
        </div>
        {data.fromEmail && (
          <div>
            <strong>From:</strong> {data.fromEmail}
          </div>
        )}
        {data.cc && (
          <div>
            <strong>CC:</strong> {data.cc}
          </div>
        )}
        {data.bcc && (
          <div>
            <strong>BCC:</strong> {data.bcc}
          </div>
        )}
      </div>
    );
  };

  const frameworkComponents = useMemo(
    () => ({
      customTooltip: CustomTooltip,
    }),
    [],
  );

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
        debounceMs: 300,
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
      tooltipComponent: CustomTooltip,
      // tooltipShowDelay: 500, // Show tooltip after 500ms
      // tooltipMouseTrack: true, // Tooltip follows mouse
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
      suppressMovable: true,

      // 🔑 CRITICAL
      wrapHeaderText: false,
      autoHeaderHeight: false,
      headerClass: "ag-header-mobile",
      cellClass: "ag-cell-mobile",
    }),
    [isMobile],
  );

  const logsData = response?.data ?? [];

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridApiRef.current = params.api;
      // Set initial sort model if needed
      if (sortModel) {
        const [colId, sort] = sortModel.startsWith("-")
          ? [sortModel.substring(1), "desc"]
          : [sortModel, "asc"];
        params.columnApi.applyColumnState({
          state: [{ colId, sort }],
          defaultState: { sort: null },
        });
      }
    },
    [sortModel],
  );

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

  // const onFilterChanged = () => {
  //   if (!gridApiRef.current) return;

  //   const model = gridApiRef.current.getFilterModel();
  //   const apiFilters = buildFilterParams(model);

  //   setFilters(apiFilters);
  //   setPage(1); // reset page on filter
  // };

  const onFilterChanged = useCallback(
    ({ api }: { api: GridApi }) => {
      const filterModel = api.getFilterModel();
      const newFilters: Record<string, any> = {};
      Object.entries(filterModel).forEach(([field, filter]) => {
        if (filter.filterType === "text" && filter.filter) {
          newFilters[field] = filter.filter;
        }
      });
      // Only update if filters actually changed
      if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
        setFilters(newFilters);
        // Reset to first page when filters change
        setPage(1);
      }
    },
    [filters],
  );

  const onSortChanged = () => {
    if (!gridApiRef.current) return;

    // const sortModel = gridApiRef.current.getSortModel();

    gridApiRef.current.state.sorting.sortModel;

    console.log("sortModel", sortModel);
    const sortQuery = sortModel
      .map((s: any) => (s.sort === "asc" ? s.colId : `-${s.colId}`))
      .join(",");

    console.log("sortQuery..", sortQuery);

    setSortModel(sortQuery);
  };

  //   const dataSource = {
  //   getRows: async (params) => {
  //     const { startRow, endRow } = params;

  //     const response = await fetch(
  //       `/api/users?start=${startRow}&limit=${endRow - startRow}`
  //     );

  //     const data = await response.json();

  //     params.successCallback(data.rows, data.totalCount);
  //   }
  // };

  const totalRows = response?.pagination?.totalPages || 0;
  console.log("totalRows", totalRows);

  useEffect(() => {
    if (gridApiRef.current && totalRows) {
      gridApiRef.current.paginationSetRowCount(totalRows, false);
    }
  }, [totalRows]);

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

  // const onFirstDataRendered = useCallback((params) => {
  //   params.api.paginationGoToPage(1);
  // }, []);

  return (
    <Table
      isMobile={isMobile}
      isLoading={isLoading}
      columnDefs={columnDefs}
      frameworkComponents={frameworkComponents}
      defaultColDef={{
        // ... other default column defs
        ...defaultColDef,
        tooltipComponent: "customTooltip",
      }}
      // defaultColDef={defaultColDef}
      logsData={logsData}
      pageSize={pageSize}
      gridApiRef={gridApiRef}
      // PAGINATION
      paginationPageSize={pageSize}
      paginationPageSizeSelector={paginationPageSizeSelector}
      paginationNumberFormatter={paginationNumberFormatter}
      onPaginationChanged={onPaginationChanged}
      shouldPaginate={true}
      enableBrowserTooltips={true}
      onFilterChanged={onFilterChanged}
      onSortChanged={onSortChanged}
      sortModel={sortModel}
      onGridReady={onGridReady}
      // datasource={datasource}
      // onFirstDataRendered={onFirstDataRendered}
      // onSortModelChange={(newModel) => {
      //   setSortModel(newModel);
      //   console.log(newModel);
      // }}
    />
  );
};

export default LogsTable;
