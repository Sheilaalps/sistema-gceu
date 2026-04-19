const rateLimit = require('express-rate-limit');

/**
 * ================================================================
 * MIDDLEWARE: RATE LIMIT AUTH (Pacote P0 - Anti Força Bruta)
 * ================================================================
 * Limita requisições nas rotas de autenticação (login/registro)
 * para proteger contra ataques de dicionário e força bruta.
 * 
 * Configuração P0 (SEVERA):
 * - Login: 5 tentativas por minuto por IP
 * - Registrar: 3 tentativas por 15 minutos por IP
 * 
 * Fallback seguro: Se não conseguir conectar ao store, a requisição é bloqueada
 * ================================================================
 */

// Rate limiter SEVERO para LOGIN (5/minuto)
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // Máximo 5 requisições
  standardHeaders: true, // Retorna info de rate limit nos headers
  legacyHeaders: false, // Desabilita X-RateLimit-* headers
  message: 'Muitas tentativas de login. Tente novamente em 1 minuto.',
  statusCode: 429,
  
  // Usar IP do cliente real (importante com proxies)
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  
  // Skip para requisições que não são POST (safety)
  skip: (req) => req.method !== 'POST',
  
  // Fail-safe: Se não conseguir verificar o rate limit, BLOQUEIA
  onLimitReached: (req, res, options) => {
    console.warn(`[SECURITY] Rate limit atingido para IP: ${req.ip}`);
  },
  
  // Handler customizado
  handler: (req, res) => {
    res.status(429).json({
      erro: 'Muitas tentativas. Tente novamente após 1 minuto.',
      retryAfter: req.rateLimit.resetTime
    });
  },
});

// Rate limiter para REGISTRO (3/15 minutos) - Menos severo que login
const registroLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // Máximo 3 requisições
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas tentativas de registro. Tente novamente em 15 minutos.',
  statusCode: 429,
  
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  
  skip: (req) => req.method !== 'POST',
  
  handler: (req, res) => {
    res.status(429).json({
      erro: 'Muitas tentativas de registro. Tente novamente após 15 minutos.',
      retryAfter: req.rateLimit.resetTime
    });
  },
});

/**
 * Rate limiter GERAL para todas as APIs (100 req/15 min por IP)
 * Proteção contra DoS genérico
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  
  skip: (req) => {
    // Skip em health checks
    if (req.path === '/health' || req.path === '/status') return true;
    return false;
  },
  
  handler: (req, res) => {
    res.status(429).json({
      erro: 'Limite de requisições excedido. Tente novamente mais tarde.'
    });
  },
});

module.exports = {
  loginLimiter,
  registroLimiter,
  apiLimiter,
};
