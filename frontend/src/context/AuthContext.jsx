import { createContext, useState, useEffect, useRef } from 'react';
import WebSocketClient from '../Service/WebSocketClient';

/**
 * ================================================================
 * AUTH CONTEXT (Pacote P0)
 * ================================================================
 * Gerencia autenticação + conexão WebSocket segura
 * 
 * Características:
 * - Token armazenado localmente
 * - Validação de token no WebSocket via headers (não URL)
 * - Auto-reconexão WebSocket quando usuário autenticado
 * - Desconexão WebSocket ao fazer logout
 * ================================================================
 */

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [carregando, setCarregando] = useState(true);
  
  // Estados WebSocket
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState(null);
  const wsRef = useRef(null);

  // Inicializar autenticação do localStorage
  useEffect(() => {
    const tokenSalvo = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo);
      setUsuario(JSON.parse(usuarioSalvo));
    }

    setCarregando(false);
  }, []);

  // Gerenciar conexão WebSocket quando token muda
  useEffect(() => {
    if (!token) {
      // Desconectar WebSocket se logout
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
        setWsConnected(false);
      }
      return;
    }

    // Conectar WebSocket se houver token
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000';
    
    if (!wsRef.current) {
      console.log('[AuthContext] Inicializando WebSocket...');
      
      wsRef.current = new WebSocketClient(wsUrl, token, {
        maxReconnectAttempts: 10,
        reconnectDelay: 3000,
      });

      // Listeners
      wsRef.current.on('connected', () => {
        console.log('[AuthContext] ✓ WebSocket conectado');
        setWsConnected(true);
        setWsError(null);
      });

      wsRef.current.on('disconnected', () => {
        console.log('[AuthContext] WebSocket desconectado');
        setWsConnected(false);
      });

      wsRef.current.on('error', (err) => {
        console.error('[AuthContext] Erro WebSocket:', err);
        setWsError(err);
      });

      // Conectar
      wsRef.current.connect().catch(err => {
        console.error('[AuthContext] Erro ao conectar WebSocket:', err);
        setWsError(err);
      });
    }

    return () => {
      // Cleanup ao desmontar
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [token]);

  const login = (dadosUsuario, tokenRecebido) => {
    setUsuario(dadosUsuario);
    setToken(tokenRecebido);
    localStorage.setItem('token', tokenRecebido);
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    setWsConnected(false);
    setWsError(null);
    
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        carregando,
        login,
        logout,
        estaAutenticado: !!token,
        
        // WebSocket
        ws: wsRef.current,
        wsConnected,
        wsError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
