import { useWebSocket as useVueUseWebSocket } from '@vueuse/core';
import { onBeforeUnmount, ref } from 'vue';

import type { WsData } from '@/types/websocket';

const WS_RECONNECT_DELAY = 1000;

export function useWebSocket() {
  const wsParsedData = ref<WsData | undefined>(undefined);
  const wsIsConnected = ref<boolean>(false);
  const wsErrorMessage = ref<string | null>(null);

  const wsUrl = import.meta.env.VITE_WS_URL;

  const { data, status, open, close, send, ws } = useVueUseWebSocket(wsUrl, {
    autoReconnect: {
      retries: 3,
      delay: WS_RECONNECT_DELAY,
      onFailed() {
        wsErrorMessage.value = 'Failed to connect to WebSocket server after multiple attempts';
      },
    },
    // heartbeat: {
    //   message: HEARTBEAT_CONFIG.MESSAGE,
    //   interval: HEARTBEAT_CONFIG.INTERVAL,
    // },
    onConnected: () => {
      wsIsConnected.value = true;
      wsErrorMessage.value = null;
    },
    onMessage: (_, event) => {
      try {
        wsParsedData.value = JSON.parse(event.data);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    },
    onDisconnected: (_, event) => {
      wsIsConnected.value = false;

      if (event.code !== 1000) {
        wsErrorMessage.value = getWebSocketErrorMessage(event.code);
      }
    },
    onError: (_, event) => {
      console.error('WebSocket error:', event);
      wsErrorMessage.value = `WebSocket connection error: ${event instanceof Error ? event.message : String(event)}`;
    },
  });

  // Helper to send JSON data
  const sendJson = (payload: unknown): boolean => {
    if (status.value !== 'OPEN') return false;
    try {
      const jsonString = JSON.stringify(payload);
      send(jsonString);
      return true;
    } catch (error) {
      console.error('JSON serialization failed:', error);
      wsErrorMessage.value = `JSON serialization failed: ${error instanceof Error ? error.message : String(error)}`;
      return false;
    }
  };

  // watch(() => wsUrl, (newUrl) => {
  //   close();
  //   open(newUrl);
  // });

  onBeforeUnmount(() => {
    close();
  });

  return {
    data,
    status,
    open,
    send,
    sendJson,
    ws,
    wsParsedData,
    wsErrorMessage,
    wsIsConnected,
  };
}

function getWebSocketErrorMessage(code: number): string {
  const errorMessages: Record<number, string> = {
    1000: 'Normal closure',
    1001: 'Server going down or client navigating away',
    1002: 'Protocol error',
    1003: 'Unsupported data',
    1005: 'No status received',
    1006: 'Connection closed abnormally',
    1007: 'Invalid frame payload data',
    1008: 'Policy violation',
    1009: 'Message too big',
    1010: 'Missing extension',
    1011: 'Server terminating connection',
    1012: 'Service restart',
    1013: 'Try again later',
    1014: 'Bad gateway',
    1015: 'TLS handshake failure',
  };
  return errorMessages[code] ?? `Connection error (code: ${code})`;
}
