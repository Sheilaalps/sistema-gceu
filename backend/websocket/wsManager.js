const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

/**
 * ================================================================
 * WEBSOCKET MANAGER (Pacote P0)
 * ================================================================
 * Gerencia todas as conexões WebSocket com:
 * - Validação de token no SUBPROTOCOLO (não URL)
 * - Rejeição de tokens na query string
 * - Heartbeat/Ping-Pong automático
 * - Limpeza de conexões fantasma
 * - Proteção contra memory leaks
 * ================================================================
 */

class WebSocketManager {
  constructor(server, jwtSecret, config = {}) {
    this.server = server;
    this.jwtSecret = jwtSecret;
    this.config = {
      heartbeatInterval: config.heartbeatInterval || 30000, // 30 segundos
      heartbeatTimeout: config.heartbeatTimeout || 60000, // 60 segundos
      maxConnections: config.maxConnections || 1000,
      ...config,
    };

    this.wss = null;
    this.clients = new Map(); // Map<WebSocket, ClientData>
    this.heartbeatTimers = new Map();
    this.pendingPongs = new Set();
  }

  /**
   * Inicializa o servidor WebSocket
   */
  initialize() {
    console.log('[WebSocket] Inicializando servidor WebSocket...');

    this.wss = new WebSocket.Server({ 
      server: this.server,
      // ⚠️ CRÍTICO: Sempre usar 'verifyClient' para validar ANTES do handshake
      verifyClient: this.verifyClient.bind(this),
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', this.handleError.bind(this));

    console.log('[WebSocket] ✓ Servidor WebSocket inicializado');
    return this.wss;
  }

  /**
   * ================================================================
   * VERIFICAÇÃO DO CLIENTE - VALIDAÇÃO DE TOKEN
   * ================================================================
   * Este é o PONTO CRÍTICO DE SEGURANÇA
   * 
   * Aqui nós:
   * 1. Rejeitamos QUALQUER token vindo na URL (query string)
   * 2. Extraímos o token do SUBPROTOCOLO (headers de handshake)
   * 3. Validamos assinatura JWT
   * 4. Rejeitamos conexão se falhar
   * ================================================================
   */
  verifyClient(info, callback) {
    const req = info.req;
    
    // ⚠️ SEGURANÇA P0: Rejeitar qualquer token na query string
    if (req.url.includes('token=') || req.url.includes('auth=')) {
      console.warn(`[WebSocket] ❌ Tentativa bloqueada: Token na URL (${req.socket.remoteAddress})`);
      return callback(false, 401, 'Token não permitido na URL');
    }

    try {
      // Extrair token do header Authorization do handshake
      // Cliente deve enviar: Authorization: Bearer <token>
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        console.warn(`[WebSocket] ❌ Conexão rejeitada: Sem token (${req.socket.remoteAddress})`);
        return callback(false, 401, 'Token não fornecido');
      }

      const token = authHeader.split(' ')[1];
      
      if (!token) {
        console.warn(`[WebSocket] ❌ Conexão rejeitada: Token malformado (${req.socket.remoteAddress})`);
        return callback(false, 401, 'Token malformado');
      }

      // Validar JWT
      let decoded;
      try {
        decoded = jwt.verify(token, this.jwtSecret);
      } catch (err) {
        console.warn(`[WebSocket] ❌ Token inválido: ${err.message} (${req.socket.remoteAddress})`);
        return callback(false, 401, 'Token inválido ou expirado');
      }

      // Armazenar dados do usuário para uso posterior
      info.userData = decoded;
      
      console.log(`[WebSocket] ✓ Cliente conectado: ${decoded.email} (ID: ${decoded.id})`);
      callback(true);
      
    } catch (error) {
      console.error(`[WebSocket] ❌ Erro na verificação do cliente:`, error.message);
      callback(false, 500, 'Erro interno de autenticação');
    }
  }

  /**
   * Handler para nova conexão
   */
  handleConnection(ws, req, info) {
    // Verificar limite de conexões
    if (this.clients.size >= this.config.maxConnections) {
      console.warn(`[WebSocket] ❌ Limite de conexões atingido (${this.clients.size})`);
      ws.close(1008, 'Servidor cheio');
      return;
    }

    const userData = info.userData || {};
    const clientId = `${userData.id}-${Date.now()}`;

    const clientData = {
      id: clientId,
      userId: userData.id,
      email: userData.email,
      nivel: userData.nivel,
      connectedAt: new Date(),
      isAlive: true,
      lastPongTime: Date.now(),
    };

    // Armazenar cliente
    this.clients.set(ws, clientData);

    // Configurar handlers
    ws.on('message', this.handleMessage.bind(this, ws, clientData));
    ws.on('close', this.handleClose.bind(this, ws, clientData));
    ws.on('error', this.handleWsError.bind(this, ws, clientData));
    ws.on('pong', this.handlePong.bind(this, ws, clientData));

    // Iniciar heartbeat (ping)
    this.startHeartbeat(ws, clientData);

    // Enviar mensagem de boas-vindas
    ws.send(JSON.stringify({
      type: 'connection_established',
      message: 'Conectado com sucesso',
      clientId: clientId,
      timestamp: new Date().toISOString(),
    }));
  }

  /**
   * Inicia o heartbeat (ping automático)
   */
  startHeartbeat(ws, clientData) {
    const interval = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        clearInterval(interval);
        return;
      }

      // Enviar ping
      ws.ping(() => {
        // Registrar que enviamos ping
        const timeout = setTimeout(() => {
          if (clientData.isAlive === false) {
            console.warn(`[WebSocket] ❌ Conexão fantasma detectada: ${clientData.email}`);
            ws.terminate(); // Derrubar conexão
          }
        }, this.config.heartbeatTimeout);

        this.heartbeatTimers.set(ws, timeout);
      });

      clientData.isAlive = false;
    }, this.config.heartbeatInterval);

    this.heartbeatTimers.set(`${clientData.id}-interval`, interval);
  }

  /**
   * Handler para Pong (resposta do cliente ao Ping)
   */
  handlePong(ws, clientData) {
    clientData.isAlive = true;
    clientData.lastPongTime = Date.now();

    // Limpar timeout de heartbeat
    if (this.heartbeatTimers.has(ws)) {
      clearTimeout(this.heartbeatTimers.get(ws));
      this.heartbeatTimers.delete(ws);
    }
  }

  /**
   * Handler para mensagens do cliente
   */
  handleMessage(ws, clientData, data) {
    try {
      const message = JSON.parse(data);

      // Validar tipo de mensagem
      if (!message.type) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Campo "type" obrigatório',
        }));
        return;
      }

      // Processar de acordo com tipo
      switch (message.type) {
        case 'ping':
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString(),
          }));
          break;

        case 'message':
          // Broadcast para todos os clientes
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
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Erro ao processar mensagem',
      }));
    }
  }

  /**
   * Handler para fechamento de conexão
   */
  handleClose(ws, clientData) {
    console.log(`[WebSocket] Conexão fechada: ${clientData.email}`);
    
    this.clients.delete(ws);
    
    // Limpar timers
    const intervalKey = `${clientData.id}-interval`;
    if (this.heartbeatTimers.has(intervalKey)) {
      clearInterval(this.heartbeatTimers.get(intervalKey));
      this.heartbeatTimers.delete(intervalKey);
    }
    if (this.heartbeatTimers.has(ws)) {
      clearTimeout(this.heartbeatTimers.get(ws));
      this.heartbeatTimers.delete(ws);
    }
  }

  /**
   * Handler para erros WebSocket
   */
  handleWsError(ws, clientData, error) {
    console.error(`[WebSocket] Erro em conexão (${clientData.email}):`, error.message);
  }

  /**
   * Handler para erros gerais
   */
  handleError(error) {
    console.error(`[WebSocket] Erro no servidor:`, error.message);
  }

  /**
   * Broadcast para todos os clientes conectados
   */
  broadcast(message) {
    const data = JSON.stringify(message);
    let count = 0;

    this.clients.forEach((clientData, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
        count++;
      }
    });

    console.log(`[WebSocket] Mensagem enviada para ${count} cliente(s)`);
  }

  /**
   * Enviar para cliente específico
   */
  sendToClient(userId, message) {
    const data = JSON.stringify(message);
    let sent = false;

    this.clients.forEach((clientData, ws) => {
      if (clientData.userId === userId && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
        sent = true;
      }
    });

    return sent;
  }

  /**
   * Obter estatísticas de conexões
   */
  getStats() {
    const stats = {
      totalConnections: this.clients.size,
      clients: [],
    };

    this.clients.forEach((clientData) => {
      stats.clients.push({
        userId: clientData.userId,
        email: clientData.email,
        connectedAt: clientData.connectedAt,
        lastPongTime: clientData.lastPongTime,
        isAlive: clientData.isAlive,
      });
    });

    return stats;
  }

  /**
   * Fechar todas as conexões
   */
  closeAll() {
    console.log('[WebSocket] Fechando todas as conexões...');
    
    this.clients.forEach((clientData, ws) => {
      ws.close(1000, 'Servidor encerrando');
    });

    this.heartbeatTimers.forEach((timer) => {
      if (typeof timer === 'object' && timer.unref) {
        clearTimeout(timer);
      } else {
        clearInterval(timer);
      }
    });

    this.heartbeatTimers.clear();
    this.clients.clear();
  }
}

module.exports = WebSocketManager;
