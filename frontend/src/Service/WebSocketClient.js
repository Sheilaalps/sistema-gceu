class WebSocketClient {
  constructor(url, token, options = {}) {
    this.url = url || 'ws://localhost:3000';
    this.token = token;
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
    if (this.ws) return Promise.resolve();

    return new Promise((resolve, reject) => {
      try {
        // Conexão limpa para evitar o bloqueio "Token na URL"
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('%c[WebSocket] ✓ Canal Aberto - Autenticando...', 'color: #00ff00;');
          
          // Autenticação via mensagem (Padrão seguro do seu servidor)
          this.send({ type: 'auth', token: this.token });

          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'ping') { this.send({ type: 'pong' }); return; }
            this.emit('message', message);
          } catch { /* erro de parse */ }
        };

        this.ws.onerror = (err) => {
          this.emit('error', err);
          reject(err);
        };
this.ws.onclose = () => {
          this.stopHeartbeat();
          if (!this.isIntentionallyClosed) {
            this.attemptReconnect();
          } else {
            this.emit('disconnected');
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  // ... (restante dos métodos attemptReconnect, heartbeat, send, on, emit, disconnect permanecem iguais)
  
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    setTimeout(() => {
      this.ws = null; // Garante que a ref seja limpa para a nova tentativa
      this.connect().catch(() => {});
    }, delay);
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === 1) this.send({ type: 'ping' });
    }, this.heartbeatInterval);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  send(message) {
    if (this.ws?.readyState !== 1) return false;
    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch { return false; }
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
    this.ws?.close(1000);
    this.ws = null;
  }
}

export default WebSocketClient;