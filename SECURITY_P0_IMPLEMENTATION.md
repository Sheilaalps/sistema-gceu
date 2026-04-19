# 🔐 PACOTE P0 DE SEGURANÇA E ESTABILIDADE

## Resumo Executivo

Este documento descreve as implementações de segurança **P0 (Priority Zero)** aplicadas ao seu projeto fullstack Express.js + React/Vite. O objetivo é blindar a aplicação contra ataques comuns e otimizar o processamento sem quebrar a lógica de negócios atual.

---

## 📋 Requisitos Implementados

### ✅ 1. Headers de Segurança Absoluta

**Arquivo**: `backend/middleware/securityHeaders.js`

Headers HTTP rigorosos são injetados em TODAS as respostas:

| Header | Objetivo | Valor |
|--------|----------|-------|
| **Content-Security-Policy** | Bloqueia recursos não autorizados | Rigoroso: apenas `'self'` + domínios confiáveis |
| **Strict-Transport-Security** | Força HTTPS | `max-age: 31536000` (1 ano) |
| **X-Content-Type-Options** | Previne MIME sniffing | `nosniff` |
| **X-Frame-Options** | Impede clickjacking | `DENY` |
| **X-XSS-Protection** | Filtro XSS do navegador | Ativado |
| **Referrer-Policy** | Controla dados do referrer | `strict-origin-when-cross-origin` |

**Como funciona no código:**

```javascript
// backend/app.js
app.use(securityHeaders); // Aplicado PRIMEIRO - protege tudo
```

**Violações reportadas em:**
- `/api/csp-report` (endpoint para relatório de violações)

---

### ✅ 2. Auth Rate Limit (Anti-Força Bruta)

**Arquivo**: `backend/middleware/rateLimitAuth.js`

Proteção severa contra ataques de força bruta:

| Rota | Limite | Janela | Nível |
|------|--------|--------|-------|
| `/users/login` | **5 requisições** | 1 minuto | 🔴 SEVERO |
| `/users/registrar` | **3 requisições** | 15 minutos | 🟠 MODERADO |
| Geral (API) | **100 requisições** | 15 minutos | 🟡 PADRÃO |

**Comportamento de bloqueio:**

```json
HTTP 429 - Too Many Requests
{
  "erro": "Muitas tentativas. Tente novamente após 1 minuto.",
  "retryAfter": 1712345678
}
```

**Como integrado:**

```javascript
// backend/routes/users.js
router.post('/login', loginLimiter, validar(usuarioLoginSchema), ...);
router.post('/registrar', registroLimiter, validar(...), ...);
```

---

### ✅ 3. WebSocket Blindado (Zero Token na URL)

**Arquivos**:
- Backend: `backend/websocket/wsManager.js`
- Frontend: `frontend/src/Service/WebSocketClient.js`

#### 🔒 Segurança no Handshake

**❌ Bloqueado (Inseguro):**
```
ws://localhost:3000?token=eyJhbGc...  ❌ Token na URL
```

**✅ Permitido (Seguro):**
```javascript
// Token enviado no header Authorization
const ws = new WebSocket('ws://localhost:3000', {
  headers: {
    'Authorization': 'Bearer eyJhbGc...'
  }
});
```

#### Fluxo de Validação:

```
[Cliente] ──── Solicita conexão com Authorization header ────> [Servidor]
           
[Servidor] ──── verifyClient():
                1. Rejeita qualquer token na URL (query string)
                2. Extrai token do header Authorization
                3. Valida assinatura JWT
                4. Rejeita se inválido ou expirado ────> [Cliente] ❌
                
[Servidor] ──── Aceita conexão se válido ────> [Cliente] ✅
```

#### Exemplos de Rejeição:

```
❌ ws://localhost:3000?token=xyz        → BLOQUEADO
❌ ws://localhost:3000?auth=xyz         → BLOQUEADO
❌ ws://localhost:3000 (sem token)      → BLOQUEADO
✅ ws://localhost:3000 + Authorization  → ACEITO
```

---

### ✅ 4. Heartbeat e Drop de Conexões (WebSocket)

**Arquivo**: `backend/websocket/wsManager.js`

Rotina automática Ping/Pong para detectar conexões fantasma:

#### Configuração Padrão:

```javascript
{
  heartbeatInterval: 30000,    // Ping a cada 30s
  heartbeatTimeout: 60000,     // Timeout de 60s para resposta
  maxConnections: 1000         // Limite de conexões simultâneas
}
```

#### Fluxo Heartbeat:

```
[Servidor] ──── PING (30s) ────> [Cliente]
                                     ↓
                                (responde)
                                     ↓
[Servidor] <──── PONG ────────────────┘ ✅ Conexão viva

[Servidor] ──── PING (30s) ────> [Cliente FANTASMA/OFFLINE]
                                     ↓
                                (nenhuma resposta)
                                     ↓
[Servidor] ──── timeout (60s) ──────> ❌ DESCONECTAR
```

#### Comportamento no Frontend:

```javascript
// frontend/src/Service/WebSocketClient.js
// Auto-responde a PING
ws.onmessage = (event) => {
  if (message.type === 'ping') {
    this.send({ type: 'pong' }); // ✓ Automático
  }
};
```

#### Gerenciamento de Memória:

- Conexões fantasma são terminadas automaticamente
- Timers de heartbeat são limpos no close
- Graceful shutdown encerra todos os WebSockets

---

### ✅ 5. Hardcode de Segurança com Fallbacks

**Arquivo**: `backend/config/securityConfig.js`

Implementa o princípio **FAIL-FAST**: o sistema recusa iniciar se chaves críticas estiverem ausentes.

#### Variáveis Críticas (OBRIGATÓRIAS):

```env
JWT_SECRET=seu-secret-aqui  # OBRIGATÓRIO - mínimo 32 chars em produção
```

#### Validação no Startup:

```
┌─────────────────────────────────────────┐
│ SERVER STARTING...                      │
├─────────────────────────────────────────┤
│ ✓ Validando JWT_SECRET...              │
│   ❌ JWT_SECRET não definido!           │
│                                         │
│ ❌ ERRO CRÍTICO DE SEGURANÇA            │
│    A aplicação NÃO pode iniciar.        │
│    Defina JWT_SECRET em .env            │
│                                         │
│ [PROCESSO ENCERRADO - Exit Code 1]      │
└─────────────────────────────────────────┘
```

#### Fallbacks Seguros Definidos:

```javascript
// backend/config/securityConfig.js
{
  jwt: {
    secret: validateEnvVar('JWT_SECRET', null, true), // null = obrigatório
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',    // fallback: 7 dias
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
  },
  cors: {
    origin: validateEnvVar('CORS_ORIGIN', 'http://localhost:5173', false),
  }
}
```

#### Relatório de Segurança:

```
╔════════════════════════════════════════════════════════════╗
║         RELATÓRIO DE SEGURANÇA - PACOTE P0                ║
╚════════════════════════════════════════════════════════════╝

✓ Ambiente: DEVELOPMENT
✓ JWT Secret: Configurado (32 chars)
✓ CORS Origin: http://localhost:5173
✓ WebSocket: ATIVADO
✓ Rate Limit Login: 5/min
✓ Headers de Segurança: ATIVADOS
```

---

## 🚀 Como Usar

### Backend Setup

#### 1. Instalar Dependências

```bash
cd backend
npm install helmet express-rate-limit ws dotenv
```

#### 2. Configurar .env

```bash
# Gerar JWT_SECRET seguro:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Criar .env com o output acima:
echo "JWT_SECRET=<resultado_acima>" >> .env
echo "CORS_ORIGIN=http://localhost:5173" >> .env
echo "NODE_ENV=development" >> .env
```

#### 3. Iniciar Servidor

```bash
npm run dev
```

**Output esperado:**

```
[WebSocket] ✓ Servidor WebSocket inicializado

╔════════════════════════════════════════════════════════════╗
║         RELATÓRIO DE SEGURANÇA - PACOTE P0                ║
╚════════════════════════════════════════════════════════════╝
✓ Ambiente: DEVELOPMENT
✓ Headers de Segurança: ATIVADOS
```

---

### Frontend Setup

#### 1. Variáveis de Ambiente

```env
# .env (frontend)
VITE_WEBSOCKET_URL=ws://localhost:3000
```

#### 2. Usar AuthContext com WebSocket

```jsx
import { AuthContext } from './context/AuthContext';

function App() {
  const { token, wsConnected, ws } = useContext(AuthContext);

  return (
    <>
      <div>Token: {token ? '✅' : '❌'}</div>
      <div>WebSocket: {wsConnected ? '✅' : '❌'}</div>
    </>
  );
}
```

#### 3. Escutar Mensagens WebSocket

```jsx
import { useContext, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';

function MyComponent() {
  const { ws } = useContext(AuthContext);

  useEffect(() => {
    if (!ws) return;

    // Registrar listener para mensagens
    ws.on('message', (message) => {
      console.log('Mensagem recebida:', message);
    });

    // Enviar mensagem
    ws.send({
      type: 'message',
      content: 'Olá servidor!'
    });

  }, [ws]);

  return <div>Componente com WebSocket</div>;
}
```

---

## 🔍 Testes de Segurança

### 1. Testar Rate Limiting

```bash
# Simular 6 tentativas de login em 1 minuto
for i in {1..6}; do
  curl -X POST http://localhost:3000/users/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","senha":"123456"}'
  echo ""
done

# A 6ª requisição deve retornar 429 Too Many Requests
```

**Output esperado:**

```json
{
  "erro": "Muitas tentativas. Tente novamente em 1 minuto.",
  "retryAfter": 1712345678
}
```

### 2. Testar WebSocket Seguro

```javascript
// ❌ Tentar conectar com token na URL (deve falhar)
const ws = new WebSocket('ws://localhost:3000?token=fake_token');
// Resultado: 401 Unauthorized

// ✅ Conectar com header Authorization (deve funcionar)
const ws = new WebSocket('ws://localhost:3000', {
  headers: { 'Authorization': 'Bearer ' + token }
});
// Resultado: 101 Switching Protocols
```

### 3. Testar Headers de Segurança

```bash
curl -i http://localhost:3000/health

# Verificar headers presentes:
# - content-security-policy
# - strict-transport-security
# - x-content-type-options
# - x-frame-options
```

### 4. Testar Heartbeat

```javascript
// Observar logs do servidor para verificar heartbeat:
// [WebSocket] Ping enviado
// [WebSocket] Pong recebido
// [WebSocket] ✓ Heartbeat OK
```

---

## ⚠️ Checklist de Segurança

- [ ] JWT_SECRET definido com 32+ caracteres em produção
- [ ] NODE_ENV=production em produção
- [ ] CORS_ORIGIN aponta apenas para domínio legítimo
- [ ] WebSocket via WSS (wss://) em produção
- [ ] HTTPS habilitado (Strict-Transport-Security funciona via HTTPS)
- [ ] Rate limiting testado
- [ ] Nenhum token na query string de WebSocket
- [ ] Graceful shutdown testado (CTRL+C)
- [ ] Logs de segurança monitorados

---

## 🔒 Produração - Checklist Extra

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Gerar secret seguro com 32+ caracteres
JWT_SECRET=your-super-secure-random-32-char-key-here-00000

# HTTPS
WEBSOCKET_URL=wss://seu-dominio.com
CORS_ORIGIN=https://seu-dominio-frontend.com

# Logging
LOG_LEVEL=info
```

---

## 📊 Monitoramento

### Acessar Estatísticas WebSocket

```bash
curl http://localhost:3000/ws/stats

# Resposta (se implementado):
{
  "totalConnections": 42,
  "clients": [
    {
      "userId": 1,
      "email": "user@example.com",
      "connectedAt": "2024-04-17T10:30:00Z",
      "isAlive": true
    }
  ]
}
```

---

## 🆘 Troubleshooting

### WebSocket não conecta

**Problema**: `Error: Token não fornecido`

**Solução**: Verificar se o frontend está enviando o header Authorization:

```javascript
// ❌ ERRADO
const ws = new WebSocket('ws://localhost:3000');

// ✅ CORRETO
const ws = new WebSocketClient('ws://localhost:3000', token);
```

### Rate limit bloqueando requisições legítimas

**Problema**: Receber 429 frequentemente

**Solução**: Ajustar limites em `backend/config/securityConfig.js`:

```javascript
rateLimit: {
  loginAttempts: 10,      // Aumentar de 5 para 10
  loginWindowMs: 60 * 1000, // Manter em 1 minuto
}
```

### JWT_SECRET cause fail-fast

**Problema**: `❌ ERRO CRÍTICO DE SEGURANÇA: Variável obrigatória não definida: JWT_SECRET`

**Solução**: Definir em .env:

```bash
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT_SECRET=$JWT_SECRET" > .env
```

---

## 📚 Referências

- [OWASP: Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Rate Limit](https://github.com/nfriedly/express-rate-limit)
- [WebSocket Security](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Última atualização**: 2024-04-17  
**Versão**: 1.0 - Pacote P0  
**Status**: ✅ Pronto para Produção

