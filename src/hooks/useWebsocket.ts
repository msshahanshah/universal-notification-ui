import { useCallback, useEffect, useRef, useState } from "react";

type UseWebSocketOptions<T> = {
  url: string;
  onMessage?: (data: T) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
};

export const useWebsocket = <T>({
  url,
  onMessage,
  reconnectInterval = 3000,
  reconnectAttempts = 0,
}: UseWebSocketOptions<T>) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const [status, setStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");

  const connect = useCallback(() => {
    if (socketRef.current) return;
    const ws = new WebSocket(url);
    socketRef.current = ws;

    setStatus("connecting");

    ws.onopen = () => {
      setStatus("connected");
      reconnectCount.current = 0;
    };

    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data) as T;
      onMessage?.(parsed);
    };

    ws.onclose = (event) => {
      console.log("event", event?.reason);
      if ([4001, 4002].includes(event.code)) {
        if (event.code === 4001) {
          localStorage.clear();
          window.location.href = "/";
          return;
        } else {
          localStorage.clear();
          window.location.href = "/";
          return;
          // refetch refresh token
        }
      }
      setStatus("disconnected");
      socketRef.current = null;

      if (reconnectCount.current < reconnectAttempts) {
        reconnectCount.current++;
        // setTimeout(connect, reconnectInterval);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [url, onMessage, reconnectInterval, reconnectAttempts]);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn("Websocket not connected");
    }
  }, []);

  const disconnect = () => {
    socketRef.current?.close();
    console.warn("Websocket disconnected");
  };

  useEffect(() => {
    connect();
    // return () => {
    //   disconnect();
    // };
    // disconnect
  }, [connect]);

  return { sendMessage, status };
};
