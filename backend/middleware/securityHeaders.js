const helmet = require('helmet');

/**
 * ================================================================
 * MIDDLEWARE: SECURITY HEADERS (Versão Corrigida)
 * ================================================================
 * Configura o Helmet de forma a não travar o servidor em desenvolvimento
 * e permitir conexões externas essenciais.
 */
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            // Permite scripts do próprio site e estilos inline (comum no React/Vite)
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            // Permite imagens locais, dados base64 e links externos (HTTPS)
            imgSrc: ["'self'", "data:", "https:"],
            // CRÍTICO: Permite conectar ao seu Backend, WebSocket e Supabase
            connectSrc: [
                "'self'", 
                "http://localhost:3000", 
                "ws://localhost:3000", 
                "http://localhost:5173",
                "https://supabase.co", // Sua URL do Supabase
                "wss://gvrglrfemzidxjffsatk.supabase.co"    // WebSocket do Supabase se necessário
            ],
            fontSrc: ["'self'", "data:", "https:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            // Removemos o upgradeInsecureRequests em dev para evitar o erro de diretiva inválida
            upgradeInsecureRequests: null, 
        },
    },
    // Desativado para evitar bloqueio de recursos entre origens diferentes em localhost
    crossOriginEmbedderPolicy: false,
    // Mantém o site fora de frames (proteção contra Clickjacking)
    frameguard: {
        action: 'deny',
    },
    // Esconde que o servidor é Node.js
    hidePoweredBy: true,
});

module.exports = securityHeaders;
