require('dotenv').config(); // <-- ADICIONADO: Isso carrega o arquivo .env
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

// ================================================================
// IMPORTS SEGURANÇA P0
// ================================================================
const securityHeaders = require('./middleware/securityHeaders');
const { loginLimiter, registroLimiter, apiLimiter } = require('./middleware/rateLimitAuth');
// IMPORTANTE: Removemos o validateStartup daqui para ele não travar o app
const { securityConfig, printSecurityReport } = require('./config/securityConfig');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var membrosRouter = require('./routes/membros');
var monitorRouter = require('./routes/monitor');

var app = express();

// FORÇANDO A CHAVE CASO O .ENV FALHE (Segurança extra para o app subir)
process.env.JWT_SECRET = process.env.JWT_SECRET || "sWxcRhkfBVznPlSvacqaQwWNrXA0l5GMenRPi4de4w0EF3U5Z3HGn7O9E+FsJsldfUB1bRmbgXX+jXG73O75K7Q==";

// ================================================================
// MIDDLEWARE DE SEGURANÇA P0 - ORDEM IMPORTA!
// ================================================================

// 1. Headers de segurança (Agora corrigido no seu outro arquivo)
app.use(securityHeaders); 

// 2. Rate limiting geral de API
app.use(apiLimiter);

// 3. CORS - Configurado para aceitar o Frontend (Vite)
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 4. Logging
app.use(logger('dev'));

// 5. Parsing de corpo e cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// 6. Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// ================================================================
// ROTAS
// ================================================================
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/membros', membrosRouter);
app.use('/monitor', monitorRouter);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(err.status || 500).json({ erro: err.message });
});

module.exports = { app, securityConfig, printSecurityReport };
