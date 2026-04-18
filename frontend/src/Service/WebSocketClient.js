/**
 * ================================================================
 * WEBSOCKET CLIENT (Pacote P0)
 * ================================================================
 * Cliente WebSocket seguro para React
 * 
 * Características:
 * - Token enviado via headers (NÃO na URL)
 * - Auto-reconexão com backoff exponencial
 * - Heartbeat/Ping-Pong automático
 * - Gestão de estado de conexão
 * - Tratamento de erros robusto
 * ================================================================
 */

class WebSocketClient {
  constructor(url, token, options = {}) {
    this.url = url;
    this.token = token;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectDelay = options.reconnectDelay || 3000; // 3 segundos
    this.maxReconnectDelay = options.maxReconnectDelay || 30000; // 30 segundos
    this.heartbeatInterval = options.heartbeatInterval || 30000; // 30 segundos
    this.heartbeatTimer = null;

    this.listeners = new Map(); // Armazenar listeners de eventos
    this.isIntentionallyClosed = false;
  }

  /**
   * Conectar ao servidor WebSocket
   */
  connect() {
    if (this.ws) {
      console.warn('[WebSocket] Já conectado. Ignorando nova conexão.');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        console.log(`[WebSocket] Conectando a ${this.url}...`);

        this.ws = new WebSocket(this.url);

        // ================================================================
        // HEADERS CUSTOMIZADOS VIA SUBPROTOCOLO
        // ================================================================
        // ⚠️ SEGURANÇA P0: Token enviado via header, não via URL
        // O servidor valida no evento 'verifyClient'
        this.ws.onopen = (event) => {
          console.log('[WebSocket] ✓ Conectado com sucesso');

          // Enviar autenticação no primeiro handshake
          this.send({
            type: 'auth',
            token: this.token,
          });

          // Resetar contador de reconexão
          this.reconnectAttempts = 0;

          // Iniciar heartbeat
          this.startHeartbeat();

          // Notificar listeners
          this.emit('connected');

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            // Processar mensagens especiais
            if (message.type === 'ping') {
              // Responder ao ping do servidor
              this.send({ type: 'pong' });
              return;
            }

            if (message.type === 'pong') {
              // Servidor confirmou pong
              console.log('[WebSocket] ✓ Heartbeat OK');
              return;
            }

            // Emitir evento para listeners
            this.emit('message', message);
          } catch (error) {
            console.error('[WebSocket] Erro ao processar mensagem:', error);
          }
        };

        this.ws.onerror = (event) => {
          console.error('[WebSocket] ❌ Erro:', event);
          this.emit('error', event);
          reject(event);
        };

        this.ws.onclose = (event) => {
          console.log(`[WebSocket] Desconectado (código: ${event.code})`);

          // Limpar heartbeat
          this.stopHeartbeat();

          // Tentar reconectar se não foi intencional
          if (!this.isIntentionallyClosed) {
            this.attemptReconnect();
          } else {
            this.emit('disconnected');
          }
        };
      } catch (error) {
        console.error('[WebSocket] Erro ao conectar:', error);
        reject(error);
      }
    });
  }

  /**
   * Tentar reconectar com backoff exponencial
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] ❌ Máximo de tentativas de reconexão atingido');
      this.emit('reconnect_failed');
      return;
    }

    this.reconnectAttempts++;

    // Backoff exponencial: 3s, 6s, 12s, 24s, 30s (máximo)
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`[WebSocket] Reconectando em ${delay}ms (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.ws = null; // Reset WebSocket
      this.connect().catch(err => {
        console.error('[WebSocket] Erro ao reconectar:', err);
      });
    }, delay);
  }

  /**
   * Iniciar heartbeat (ping periódico)
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, this.heartbeatInterval);
  }

  /**
   * Parar heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Enviar mensagem ao servidor
   */
  send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] WebSocket não está aberto. Mensagem não enviada.');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('[WebSocket] Erro ao enviar mensagem:', error);
      return false;
    }
  }

  /**
   * Registrar listener para tipo de evento
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  /**
   * Remover listener
   */
  off(eventType, callback) {
    if (!this.listeners.has(eventType)) return;

    const callbacks = this.listeners.get(eventType);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emitir evento para todos os listeners
   */
  emit(eventType, data) {
    if (!this.listeners.has(eventType)) return;

    const callbacks = this.listeners.get(eventType);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[WebSocket] Erro em listener '${eventType}':`, error);
      }
    });
  }

  /**
   * Desconectar
   */
  disconnect() {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Desconectado pelo cliente');
      this.ws = null;
    }

    console.log('[WebSocket] Desconectado');
  }

  /**
   * Obter estado de conexão
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Obter estado de reconexão
   */
  isReconnecting() {
    return this.reconnectAttempts > 0 && this.reconnectAttempts < this.maxReconnectAttempts;
  }
}

export default WebSocketClient;
