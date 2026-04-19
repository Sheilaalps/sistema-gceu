/**
 * ================================================================
 * GLOBAL WEBSOCKET MANAGER (Pacote P0)
 * ================================================================
 * Singleton para acessar o gerenciador WebSocket em qualquer
 * parte da aplicação (rotas, middleware, etc)
 */

let globalWSManager = null;

/**
 * Definir gerenciador WebSocket global
 */
function setWSManager(wsManager) {
  globalWSManager = wsManager;
}

/**
 * Obter gerenciador WebSocket global
 */
function getWSManager() {
  return globalWSManager;
}

/**
 * Verificar se WebSocket está disponível
 */
function isWSAvailable() {
  return globalWSManager !== null;
}

/**
 * Broadcast para todos os clientes
 */
function broadcast(message) {
  if (!globalWSManager) return false;
  globalWSManager.broadcast(message);
  return true;
}

/**
 * Enviar para cliente específico
 */
function sendToClient(userId, message) {
  if (!globalWSManager) return false;
  return globalWSManager.sendToClient(userId, message);
}

/**
 * Obter estatísticas
 */
function getStats() {
  if (!globalWSManager) return null;
  return globalWSManager.getStats();
}

module.exports = {
  setWSManager,
  getWSManager,
  isWSAvailable,
  broadcast,
  sendToClient,
  getStats,
};
