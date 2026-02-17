import { useMemo } from "react";
import { GridReadyEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import { myTheme } from "src/layouts/dashboard/logs/constant";
import "./table.css";

export const Table = ({
  isMobile,
  isLoading,
  columnDefs,
  defaultColDef,
  logsData,
  onPaginationChanged,
  onFilterChanged,
  gridApiRef,
  paginationPageSize,
  paginationPageSizeSelector,
  shouldPaginate,
  enableBrowserTooltips
}: any) => {
  const wValue = "100%";
  const hValue = "100%";

  const onGridReady = (params: GridReadyEvent) => {
    gridApiRef.current = params.api;
  };

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

  return (
    <div style={containerStyle} className="ag-theme-quartz grid-12-font">
      <div
        style={{
          ...gridStyle,
          minHeight: 0,
          overflowX: isMobile ? "auto" : "hidden",
        }}
      >
        <AgGridReact
          theme={myTheme}
          onGridReady={onGridReady}
          onPaginationChanged={onPaginationChanged}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={logsData}
          rowHeight={50}
          pagination={shouldPaginate}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={
            shouldPaginate ? paginationPageSizeSelector : false
          }
          suppressPaginationPanel={!shouldPaginate}
          animateRows
          headerHeight={50}
          enableCellTextSelection
          loading={isLoading}
          onFilterChanged={onFilterChanged}
          enableBrowserTooltips={enableBrowserTooltips}
          tooltipShowDelay={500}
        />
      </div>
    </div>
  );
};
