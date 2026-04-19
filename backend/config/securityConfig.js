/**
 * ================================================================
 * CONFIG: SECURITY CONFIGURATION (Pacote P0)
 * ================================================================
 * Validação OBRIGATÓRIA de variáveis críticas com HARDCODE de fallback
 * Sistema implementa "fail-fast": recusa iniciar se chaves críticas faltem
 * 
 * CRÍTICO: Todas as variáveis abaixo devem ser definidas em .env
 * Se faltarem, a aplicação NÃO inicia (fail-fast principle)
 * ================================================================
 */

/**
 * Função auxiliar para validar variáveis obrigatórias
 */
function validateEnvVar(varName, fallback = null, required = true) {
  const value = process.env[varName];
  
  if (!value && required) {
    console.error(`\n❌ ERRO CRÍTICO DE SEGURANÇA:`);
    console.error(`   Variável obrigatória não definida: ${varName}`);
    console.error(`   A aplicação NÃO pode iniciar sem esta configuração.`);
    console.error(`   Defina em .env e tente novamente.\n`);
    process.exit(1); // FAIL-FAST: Encerra processo
  }
  
  return value || fallback;
}

/**
 * CONFIGURAÇÕES DE SEGURANÇA - P0 PACKAGE
 */
const securityConfig = {
  // ========================
  // JWT & AUTENTICAÇÃO
  // ========================
  jwt: {
    secret: validateEnvVar('JWT_SECRET', null, true), // OBRIGATÓRIO
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256',
  },

  // ========================
  // AMBIENTE & EXECUÇÃO
  // ========================
  environment: process.env.NODE_ENV || 'development',
  
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',

  // ========================
  // SERVIDOR HTTP
  // ========================
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
  },

  // ========================
  // CORS & FRONTEND
  // ========================
  cors: {
    origin: validateEnvVar('CORS_ORIGIN', 'http://localhost:5173', false),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 horas
  },

  // ========================
  // WEBSOCKET
  // ========================
  websocket: {
    enabled: process.env.WEBSOCKET_ENABLED !== 'false',
    heartbeatInterval: 30000, // 30 segundos
    heartbeatTimeout: 60000, // 60 segundos
    url: process.env.WEBSOCKET_URL || 'ws://localhost:3000',
  },

  // ========================
  // RATE LIMITING
  // ========================
  rateLimit: {
    loginAttempts: 5, // 5 tentativas por minuto
    loginWindowMs: 60 * 1000, // 1 minuto
    
    registroAttempts: 3, // 3 tentativas por 15 minutos
    registroWindowMs: 15 * 60 * 1000, // 15 minutos
    
    apiLimit: 100, // 100 requisições por 15 minutos
    apiWindowMs: 15 * 60 * 1000, // 15 minutos
  },

  // ========================
  // LOGGING & MONITORAMENTO
  // ========================
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    logSecurityEvents: true,
  },

  // ========================
  // VALIDAÇÃO DE SEGURANÇA
  // ========================
  validation: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
  },
};

/**
 * Função para imprimir relatório de configuração no startup
 */
function printSecurityReport() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         RELATÓRIO DE SEGURANÇA - PACOTE P0                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n✓ Ambiente: ${securityConfig.environment.toUpperCase()}`);
  console.log(`✓ JWT Secret: Configurado (${securityConfig.jwt.secret.length} chars)`);
  console.log(`✓ CORS Origin: ${securityConfig.cors.origin}`);
  console.log(`✓ WebSocket: ${securityConfig.websocket.enabled ? 'ATIVADO' : 'DESATIVADO'}`);
  console.log(`✓ Rate Limit Login: ${securityConfig.rateLimit.loginAttempts}/min`);
  console.log(`✓ Headers de Segurança: ATIVADOS`);
  console.log('\n');
}

/**
 * Validação final no startup
 */
function validateStartup() {
  const errors = [];

  // Verificar ambiente
  if (!process.env.NODE_ENV) {
    console.warn('⚠️  NODE_ENV não definido. Usando: development');
  }

  // Verificar JWT_SECRET em produção
  if (securityConfig.isProduction && process.env.JWT_SECRET?.length < 32) {
    errors.push('JWT_SECRET deve ter pelo menos 32 caracteres em produção');
  }

  if (errors.length > 0) {
    console.error('\n❌ ERROS DE CONFIGURAÇÃO:');
    errors.forEach(err => console.error(`   - ${err}`));
    console.error('\n');
    if (securityConfig.isProduction) {
      process.exit(1);
    }
  }

  return true;
}

// Executar validação
validateStartup();

module.exports = {
  securityConfig,
  printSecurityReport,
  validateStartup,
};
