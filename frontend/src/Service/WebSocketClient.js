class WebSocketClient {
    constructor(url, token, options = {}) {
        this.url = url || 'ws://localhost:3000';
        
        let rawToken = typeof token === 'object' 
            ? (token.access_token || token.token || JSON.stringify(token)) 
            : token;
        if (typeof rawToken === 'string' && rawToken.startsWith('Bearer ')) {
            rawToken = rawToken.slice(7);
        }
        this.token = rawToken;

        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
        this.reconnectDelay = options.reconnectDelay || 3000;
        this.maxReconnectDelay = options.maxReconnectDelay || 30000;
        this.heartbeatInterval = options.heartbeatInterval || 30000;
        this.heartbeatTimer = null;
        this.listeners = new Map();
        this.isIntentionallyClosed = false;
    }

    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            try {
                // ✅ Token via subprotocolo — como o backend espera
                this.ws = new WebSocket(this.url, [this.token]);

                this.ws.onopen = () => {
                    console.log('%c[WebSocket] ✓ Conectado', 'color: #00ff00;');
                    this.reconnectAttempts = 0;
                    this.startHeartbeat();
                    this.emit('connected');
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.emit('message', message);
                    } catch {
                        this.emit('message', event.data);
                    }
                };

                this.ws.onerror = (event) => {
                    const mensagem = event?.message || 'Falha na conexão WebSocket';
                    console.error('[WebSocket] Erro na conexão:', mensagem);
                    this.emit('error', mensagem);
                    reject(new Error(mensagem));
                };

                this.ws.onclose = (event) => {
                    this.stopHeartbeat();
                    this.emit('disconnected');
                    if (!this.isIntentionallyClosed) {
                        console.warn(`[WebSocket] Desconectado (código ${event.code}), reconectando...`);
                        this.attemptReconnect();
                    }
                };

            } catch (err) {
                this.emit('error', err.message || 'Erro ao criar WebSocket');
                reject(err);
            }
        });
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[WebSocket] Máximo de tentativas atingido.');
            this.emit('error', 'Máximo de tentativas de reconexão atingido');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );

        console.log(`[WebSocket] Tentativa ${this.reconnectAttempts} em ${delay}ms...`);

        setTimeout(() => {
            this.ws = null;
            this.connect().catch(() => {});
        }, delay);
    }

    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, this.heartbeatInterval);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    send(message) {
        if (this.ws?.readyState !== WebSocket.OPEN) {
            console.warn('[WebSocket] Tentativa de envio sem conexão ativa');
            return false;
        }
        try {
            this.ws.send(typeof message === 'object' ? JSON.stringify(message) : message);
            return true;
        } catch (err) {
            console.error('[WebSocket] Erro ao enviar:', err);
            return false;
        }
    }

    on(eventType, callback) {
        if (!this.listeners.has(eventType)) this.listeners.set(eventType, []);
        this.listeners.get(eventType).push(callback);
    }

    emit(eventType, data) {
        this.listeners.get(eventType)?.forEach(callback => callback(data));
    }

    disconnect() {
        this.isIntentionallyClosed = true;
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close(1000, 'Desconexão intencional');
            this.ws = null;
        }
    }
}

export default WebSocketClient;