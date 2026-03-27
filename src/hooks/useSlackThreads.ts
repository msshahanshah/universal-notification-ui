import { useQuery } from "@tanstack/react-query";
import { fetchSlackThreads } from "src/api/slack-threads.api";

export const useSlackThreads = () => {
  return useQuery({
    queryKey: ["slack-threads"],
    queryFn: fetchSlackThreads,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
};

// export const useThreadMessages = (messageId: string) => {
//   return useQuery({
//     queryKey: ["thread-messages", messageId],
//     queryFn: () => fetchThreadMessages(messageId),
//     enabled: !!messageId,
//     refetchOnWindowFocus: false,
//     staleTime: 0,
//   });
// };
