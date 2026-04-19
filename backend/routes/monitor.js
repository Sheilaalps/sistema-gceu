const express = require('express');
const router = express.Router();
const { getStats, isWSAvailable } = require('../websocket/wsGlobal');
const { verificarToken, verificarNivel } = require('../middleware/auth');

/**
 * ================================================================
 * ROTAS DE MONITORAMENTO (Pacote P0)
 * ================================================================
 * Endpoints para monitorar saúde e estatísticas do sistema
 */

// ================================================================
// GET /monitor/health - Health Check Geral
// ================================================================
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    websocket: {
      enabled: isWSAvailable(),
    },
    uptime: process.uptime(),
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024), // MB
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // MB
    },
  });
});

// ================================================================
// GET /monitor/websocket/stats - Estatísticas WebSocket (Admin)
// ================================================================
router.get('/websocket/stats', verificarToken, verificarNivel('admin'), (req, res) => {
  try {
    if (!isWSAvailable()) {
      return res.status(503).json({
        erro: 'WebSocket não disponível',
      });
    }

    const stats = getStats();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      websocket: stats,
    });
  } catch (error) {
    console.error('[Monitor] Erro ao obter stats:', error);
    res.status(500).json({
      erro: 'Erro ao obter estatísticas',
    });
  }
});

// ================================================================
// GET /monitor/websocket/connections - Conexões Ativas (Admin)
// ================================================================
router.get('/websocket/connections', verificarToken, verificarNivel('admin'), (req, res) => {
  try {
    if (!isWSAvailable()) {
      return res.status(503).json({
        erro: 'WebSocket não disponível',
      });
    }

    const stats = getStats();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      totalConnections: stats.totalConnections,
      clients: stats.clients.map(client => ({
        userId: client.userId,
        email: client.email,
        connectedAt: client.connectedAt,
        isAlive: client.isAlive,
        timeSinceLastPong: Math.round((Date.now() - new Date(client.lastPongTime).getTime()) / 1000),
      })),
    });
  } catch (error) {
    console.error('[Monitor] Erro ao obter conexões:', error);
    res.status(500).json({
      erro: 'Erro ao obter conexões',
    });
  }
});

module.exports = router;
