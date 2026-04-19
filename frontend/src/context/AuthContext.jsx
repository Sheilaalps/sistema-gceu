import { createContext, useState, useEffect, useRef, useMemo } from 'react';
import WebSocketClient from '../Service/WebSocketClient';

// Criamos o contexto
const AuthContext = createContext();

/**
 * AUTH PROVIDER 
 */
function AuthProvider({ children }) {
  // Inicialização direta do localStorage: resolve o erro de "setState synchronously within an effect"
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('usuario');
    try {
      return salvo && salvo !== 'null' ? JSON.parse(salvo) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState(() => {
    const salvo = localStorage.getItem('token');
    return salvo && salvo !== 'null' ? salvo : null;
  });

  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState(null);
  const wsRef = useRef(null);

  // Gerenciador do WebSocket
  useEffect(() => {
    if (!token || token === 'null') {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
        // Agendamento para o próximo ciclo: evita o erro de cascading renders
        setTimeout(() => setWsConnected(false), 0);
      }
      return;
    }

    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000';
    
    if (!wsRef.current) {
      const client = new WebSocketClient(wsUrl, token, {
        maxReconnectAttempts: 5,
        reconnectDelay: 5000,
      });

      wsRef.current = client;

      client.on('connected', () => {
        setWsConnected(true);
        setWsError(null);
      });

      client.on('disconnected', () => setWsConnected(false));
      client.on('error', (err) => setWsError(err));

      client.connect().catch(() => {});
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [token]);

  const login = (dadosUsuario, tokenRecebido) => {
    localStorage.setItem('token', tokenRecebido);
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
    setToken(tokenRecebido);
    setUsuario(dadosUsuario);
  };

  const logout = () => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    setWsConnected(false);
  };

  // useMemo protege contra re-renderizações desnecessárias e erro de acesso a Ref no render
  const value = useMemo(() => ({
    usuario,
    token,
    login,
    logout,
    estaAutenticado: !!token && token !== 'null',
    wsConnected,
    wsError,
    // Acessar a ref dentro de uma função é a forma segura exigida pelo React
    enviarMensagem: (data) => wsRef.current?.send(data)
  }), [usuario, token, wsConnected, wsError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Exportação separada para o Fast Refresh do Vite funcionar
export { AuthContext, AuthProvider };