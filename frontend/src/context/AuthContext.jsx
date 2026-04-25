import { createContext, useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../Service/supabaseClient';
import WebSocketClient from '../Service/WebSocketClient';

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        try {
            const salvo = localStorage.getItem('usuario');
            return salvo && salvo !== 'null' ? JSON.parse(salvo) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        const salvo = localStorage.getItem('token');
        return salvo && salvo !== 'null' ? salvo : null;
    });

    const [wsConnected, setWsConnected] = useState(false);
    const [wsError, setWsError] = useState(null);
    const wsRef = useRef(null);

    // 🔌 WEBSOCKET - escuta renovação automática de token do Supabase
    useEffect(() => {
        let active = true;

        const conectarWS = (accessToken) => {
            if (wsRef.current) wsRef.current.disconnect();

            if (!accessToken) {
                setWsConnected(false);
                return;
            }

            const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000';
            const client = new WebSocketClient(wsUrl, accessToken, {
                maxReconnectAttempts: 5,
                reconnectDelay: 3000,
            });

            wsRef.current = client;

            client.on('connected', () => {
                if (active) { setWsConnected(true); setWsError(null); }
            });
            client.on('disconnected', () => {
                if (active) setWsConnected(false);
            });
            client.on('error', (err) => {
                if (active) {
                    setWsError(err || 'Erro desconhecido na conexão');
                    console.error('[WebSocket] Erro:', err);
                }
            });

            client.connect().catch(() => {});
        };

        // Escuta mudanças de sessão (login, logout, renovação de token)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!active) return;
            if (session?.access_token) {
                setToken(session.access_token);
                localStorage.setItem('token', session.access_token);
                conectarWS(session.access_token);
            } else {
                setToken(null);
                localStorage.removeItem('token');
                conectarWS(null);
            }
        });

        // Conecta com sessão atual ao inicializar
        supabase.auth.getSession().then(({ data }) => {
            if (active && data.session?.access_token) {
                conectarWS(data.session.access_token);
            }
        });

        return () => {
            active = false;
            subscription.unsubscribe();
            if (wsRef.current) {
                wsRef.current.disconnect();
                wsRef.current = null;
            }
        };
    }, []); // sem dependência de [token] — Supabase gerencia isso

    // 🔑 LOGIN
    const login = (dadosUsuario, tokenRecebido) => {
        localStorage.setItem('token', tokenRecebido);
        localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
        localStorage.setItem('loginTime', Date.now().toString());
        setToken(tokenRecebido);
        setUsuario(dadosUsuario);
    };

    // 🚪 LOGOUT
    const logout = async () => {
        if (wsRef.current) {
            wsRef.current.disconnect();
            wsRef.current = null;
        }
        await supabase.auth.signOut();
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('loginTime');
        setToken(null);
        setUsuario(null);
        setWsConnected(false);
    };

    // ⏱️ LOGOUT AUTOMÁTICO (15 MINUTOS de inatividade)
    useEffect(() => {
        const TEMPO_MAX = 15 * 60 * 1000;

        const verificarSessao = async () => {
            const loginTime = localStorage.getItem('loginTime');
            if (loginTime && Date.now() - parseInt(loginTime) > TEMPO_MAX) {
                await logout();
                window.location.href = '/login';
            }
        };

        verificarSessao();
        const timer = setInterval(verificarSessao, 60 * 1000);
        return () => clearInterval(timer);
    }, []);

    const value = useMemo(() => ({
        usuario,
        token,
        login,
        logout,
        estaAutenticado: !!token && token !== 'null',
        wsConnected,
        wsError,
        enviarMensagem: (data) => wsRef.current?.send(data)
    }), [usuario, token, wsConnected, wsError]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };