const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const EventEmitter = require('events');

class WebSocketManager extends EventEmitter {
  constructor(server, jwtSecret, config = {}) {
    super();
    this.server = server;
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET;
    this.config = {
      heartbeatInterval: config.heartbeatInterval || 30000,
      heartbeatTimeout: config.heartbeatTimeout || 60000,
      maxConnections: config.maxConnections || 1000,
      ...config,
    };

    this.verifyClient = this.verifyClient.bind(this); // Garante que 'this' esteja sempre correto

    this.wss = null;
    this.clients = new Map();
    this.heartbeatTimers = new Map();
    this.pendingPongs = new Set();

    this.errorMetrics = {
      currentMinute: 0,
      lastMinute: 0,
      total: 0
    };
  }

  initialize() {
    console.log('[WebSocket] Inicializando servidor WebSocket...');

    this.wss = new WebSocket.Server({ 
      server: this.server, // O servidor HTTP que o WebSocket vai usar
      verifyClient: this.verifyClient, // verifyClient já está bound no construtor
      handleProtocols: (protocols) => {
        return protocols[0];
      }
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', this.handleError.bind(this));

    setInterval(() => {
      this.errorMetrics.lastMinute = this.errorMetrics.currentMinute;
      this.errorMetrics.currentMinute = 0;
      if (this.errorMetrics.lastMinute > 0) {
        console.log(`[WebSocket] Monitoramento: ${this.errorMetrics.lastMinute} erros no último minuto.`);
      }
    }, 60000);

    console.log('[WebSocket] ✓ Servidor WebSocket inicializado');
    return this.wss;
  }

  verifyClient(info, callback) {
    const req = info.req;
    const origin = info.origin;

    // 1. Verificação de Origem (Segurança extra contra CSWSH)
    const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
    if (process.env.NODE_ENV === 'production' && origin !== allowedOrigin) {
      console.warn(`[WebSocket] ❌ Origem rejeitada: ${origin}`);
      return callback(false, 403, 'Origem não permitida');
    }
    
    if (req.url.includes('token=') || req.url.includes('auth=')) {
      console.warn(`[WebSocket] ❌ Tentativa bloqueada: Token na URL (${req.socket.remoteAddress})`);
      return callback(false, 401, 'Token não permitido na URL');
    }

    try {
      let protocols = req.headers['sec-websocket-protocol'];
      let token = protocols?.split(',')[0]?.trim();
      
      if (!token) {
        console.warn(`[WebSocket] ❌ Conexão rejeitada: Sem token (${req.socket.remoteAddress})`);
        return callback(false, 401, 'Token não fornecido');
      }

      try {
        token = decodeURIComponent(token);
        token = token.replace(/['"]+/g, '');
        if (token.startsWith('Bearer ')) {
          token = token.slice(7);
        }
      } catch (e) {
        console.warn(`[WebSocket] ❌ Erro ao decodificar protocolo: ${e.message}`);
      }

      let decoded;
      try {
        // Só converte para buffer se o secret for explicitamente base64 no app.js, 
        // caso contrário usa a string original (mais seguro para secrets hex/comuns)
        const secret = this.jwtSecret.length > 60 
          ? Buffer.from(this.jwtSecret, 'base64') 
          : this.jwtSecret;

        decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
      } catch (err) {
        console.warn(`[WebSocket] ❌ Token inválido: ${err.message} (${req.socket.remoteAddress})`);
        return callback(false, 401, 'Token inválido ou expirado');
      }

      req.userData = decoded;
      console.log(`[WebSocket] ✓ Cliente autenticado: ${decoded.email || decoded.sub}`);
      callback(true);
      
    } catch (error) {
      this.handleError(error);
      callback(false, 500, 'Erro interno de autenticação');
    }
  }

  handleConnection(ws, req) {
    try {
      if (this.clients.size >= this.config.maxConnections) {
        console.warn(`[WebSocket] ❌ Limite de conexões atingido (${this.clients.size})`);
        ws.close(1008, 'Servidor cheio');
        return;
      }

      const userData = req.userData || {};
      const clientId = `${userData.sub || userData.id}-${Date.now()}`;

      const clientData = {
        id: clientId,
        userId: userData.sub || userData.id,
        email: userData.email,
        nivel: userData.nivel,
        connectedAt: new Date(),
        isAlive: true,
        lastPongTime: Date.now(),
      };

      this.clients.set(ws, clientData);

      ws.on('message', this.handleMessage.bind(this, ws, clientData));
      ws.on('close', this.handleClose.bind(this, ws, clientData));
      ws.on('error', this.handleWsError.bind(this, ws, clientData));
      ws.on('pong', this.handlePong.bind(this, ws, clientData));

      this.startHeartbeat(ws, clientData);

      ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'Conectado com sucesso',
        clientId: clientId,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      this.handleError(error);
      ws.close(1011, 'Erro interno no servidor');
    }
  }

  startHeartbeat(ws, clientData) {
    const interval = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        clearInterval(interval);
        return;
      }

      ws.ping(() => {
        const timeout = setTimeout(() => {
          if (clientData.isAlive === false) {
            console.warn(`[WebSocket] ❌ Conexão fantasma detectada: ${clientData.email}`);
            ws.terminate();
          }
        }, this.config.heartbeatTimeout);

        this.heartbeatTimers.set(ws, timeout);
      });

      clientData.isAlive = false;
    }, this.config.heartbeatInterval);

    this.heartbeatTimers.set(`${clientData.id}-interval`, interval);
  }

  handlePong(ws, clientData) {
    clientData.isAlive = true;
    clientData.lastPongTime = Date.now();

    if (this.heartbeatTimers.has(ws)) {
      clearTimeout(this.heartbeatTimers.get(ws));
      this.heartbeatTimers.delete(ws);
    }
  }

  handleMessage(ws, clientData, data) {
    try {
      const message = JSON.parse(data);

      if (!message.type) {
        ws.send(JSON.stringify({ type: 'error', message: 'Campo "type" obrigatório' }));
        return;
      }

      switch (message.type) {
        case 'message':
          this.broadcast({
            type: 'message',
            from: clientData.email,
            content: message.content,
            timestamp: new Date().toISOString(),
          });
          break;

        default:
          console.log(`[WebSocket] Mensagem desconhecida: ${message.type}`);
      }

    } catch (error) {
      console.error(`[WebSocket] Erro ao processar mensagem:`, error.message);
      ws.send(JSON.stringify({}));
    }
  }

  handleClose(ws, clientData) {
    console.log(`[WebSocket] 🚪 Cliente desconectado: ${clientData.email || clientData.userId}`);
    
    // Limpar timeouts de heartbeat
    if (this.heartbeatTimers.has(ws)) {
      clearTimeout(this.heartbeatTimers.get(ws));
      this.heartbeatTimers.delete(ws);
    }
    
    const intervalKey = `${clientData.id}-interval`;
    if (this.heartbeatTimers.has(intervalKey)) {
      clearInterval(this.heartbeatTimers.get(intervalKey));
      this.heartbeatTimers.delete(intervalKey);
    }

    this.clients.delete(ws);
    this.emit('disconnected', clientData);
  }

  handleWsError(ws, clientData, error) {
    console.error(`[WebSocket] ❌ Erro no cliente ${clientData.email}:`, error.message);
    this.handleClose(ws, clientData);
  }

  handleError(error) {
    this.errorMetrics.currentMinute++;
    this.errorMetrics.total++;
    console.error(`[WebSocket] ❌ Erro no servidor:`, error.message);
    this.emit('error', error);
  }

  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach((clientData, clientWs) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(message);
      }
    });
  }

  sendToClient(userId, message) {
    let sent = false;
    const data = JSON.stringify(message);
    this.clients.forEach((clientData, ws) => {
      if (clientData.userId === userId && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
        sent = true;
      }
    });
    return sent;
  }

  getStats() {
    return {
      activeConnections: this.clients.size,
      errorsLastMinute: this.errorMetrics.lastMinute,
      totalErrors: this.errorMetrics.total,
      uptime: process.uptime()
    };
  }

  closeAll() {
    console.log('[WebSocket] Encerrando todas as conexões...');
    this.clients.forEach((clientData, ws) => {
      ws.close(1000, 'Servidor encerrando');
    });
    
    this.heartbeatTimers.forEach((timer) => {
      clearInterval(timer);
      clearTimeout(timer);
    });
    
    if (this.wss) {
      this.wss.close();
    }
  }
}

module.exports = WebSocketManager;