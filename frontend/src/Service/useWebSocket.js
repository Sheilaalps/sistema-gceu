/**
 * ================================================================
 * HOOK: USE_WEBSOCKET (Pacote P0)
 * ================================================================
 * Hook React para gerenciar conexão WebSocket segura
 * 
 * Uso:
 * const { ws, connected, send } = useWebSocket('ws://localhost:3000', token);
 * 
 * ws.on('message', (msg) => console.log('Nova mensagem:', msg));
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import WebSocketClient from './WebSocketClient';

export const useWebSocket = (url, token) => {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState(null);

  // Inicializar WebSocket
  useEffect(() => {
    if (!token || !url) {
      console.warn('[useWebSocket] Token ou URL não fornecido');
      return;
    }

    try {
      wsRef.current = new WebSocketClient(url, token);

      // Listeners
      wsRef.current.on('connected', () => {
        console.log('[useWebSocket] ✓ Conectado');
        setConnected(true);
        setReconnecting(false);
        setError(null);
      });

      wsRef.current.on('disconnected', () => {
        console.log('[useWebSocket] Desconectado');
        setConnected(false);
      });

      wsRef.current.on('error', (err) => {
        console.error('[useWebSocket] Erro:', err);
        setError(err);
      });

      wsRef.current.on('reconnect_failed', () => {
        console.error('[useWebSocket] Reconexão falhou');
        setError(new Error('Falha na reconexão'));
      });

      // Conectar
      wsRef.current.connect().catch(err => {
        console.error('[useWebSocket] Erro ao conectar:', err);
        setError(err);
      });

    } catch (err) {
      console.error('[useWebSocket] Erro ao inicializar:', err);
      setError(err);
    }

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [url, token]);

  // Função para enviar mensagem
  const send = useCallback((message) => {
    if (wsRef.current) {
      return wsRef.current.send(message);
    }
    return false;
  }, []);

  // Função para registrar listener
  const on = useCallback((eventType, callback) => {
    if (wsRef.current) {
      wsRef.current.on(eventType, callback);
    }
  }, []);

  // Função para remover listener
  const off = useCallback((eventType, callback) => {
    if (wsRef.current) {
      wsRef.current.off(eventType, callback);
    }
  }, []);

  return {
    ws: wsRef.current,
    connected,
    reconnecting,
    error,
    send,
    on,
    off,
  };
};

export default useWebSocket;
