import { useQuery } from "@tanstack/react-query";

import { fetchLogs, fetchLogStatus } from "src/api/logs.api";
import { logsKeys } from "src/api/queryKeys";

export const useLogs = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: logsKeys.list(params as any),
    queryFn: () => fetchLogs(params),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useLogStatus = (id: number) => {
  return useQuery({
    queryKey: ["logs", "status", id],
    queryFn: () => fetchLogStatus(id),
    enabled: false,
    staleTime: 0,
  });
};
