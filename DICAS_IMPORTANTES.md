# ⭐ DICAS IMPORTANTES - Pacote P0

## 🎯 5 Coisas Críticas que Você PRECISA Saber

### 1️⃣ JWT_SECRET é OBRIGATÓRIO
```
❌ SEM JWT_SECRET → Aplicação NÃO inicia
✅ COM JWT_SECRET → Tudo funciona
```

**Solução:**
```bash
# Gerar novo secret (32+ caracteres aleatórios)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Adicionar ao .env
JWT_SECRET=seu_secret_aqui_com_minimo_32_caracteres
```

---

### 2️⃣ WebSocket Token no Navegador
```javascript
// ❌ ERRADO - Bloqueado por segurança
ws://localhost:3000?token=xyz

// ✅ CERTO - Via Subprotocolo (Única forma segura no browser)
const token = "seu_jwt_aqui";
const ws = new WebSocket('ws://localhost:3000', [token]);
```

---

### 3️⃣ Rate Limit no Login é SEVERO (5/min)
```
⚠️ Se fizer 6 logins em 1 minuto:
   → HTTP 429 Too Many Requests
   → Bloqueado por 1 minuto

💡 Isso é PROPOSITAL - Proteção contra força bruta
```

---

### 4️⃣ Relatório de Segurança Aparece no Console
```
Ao iniciar o servidor, você verá:

╔════════════════════════════════════════════════════════════╗
║         RELATÓRIO DE SEGURANÇA - PACOTE P0                ║
╚════════════════════════════════════════════════════════════╝
✓ Ambiente: DEVELOPMENT
✓ JWT Secret: Configurado (32 chars)
✓ CORS Origin: http://localhost:5173
✓ WebSocket: ATIVADO
✓ Rate Limit Login: 5/min
✓ Headers de Segurança: ATIVADOS

❌ Se alguma linha FALTAR = Erro crítico
```

---

### 5️⃣ Graceful Shutdown com SIGTERM
```bash
# Para o servidor GRACEFULLY (sem perder conexões)
CTRL+C

# O servidor vai:
1. Fechar todos os WebSockets
2. Limpar timers de heartbeat
3. Encerrar processo cleanly

# Não faça kill -9, deixe o CTRL+C funcionar!
```

---

## 🚀 Quick Checklist Antes de Colocar em Produção

```bash
# ✅ 1. JWT_SECRET definido com 32+ caracteres
grep JWT_SECRET backend/.env | wc -c
# Deve retornar número > 32

# ✅ 2. NODE_ENV em produção
grep NODE_ENV backend/.env
# Deve conter: NODE_ENV=production

# ✅ 3. CORS_ORIGIN aponta para domínio real
grep CORS_ORIGIN backend/.env
# Deve ter seu domínio REAL, não localhost

# ✅ 4. WebSocket em WSS (HTTPS)
grep WEBSOCKET_URL backend/.env
# Deve ter: wss://seu-dominio.com (com WSS, não WS)

# ✅ 5. Testes passando
node backend/security-tests.js
# Todos devem passar (0 failed)

# ✅ 6. Nenhuma senha/secret no código
grep -r "senha.*:" backend/
grep -r "secret:" backend/ | grep -v ".env"
# Não deve retornar nada sensível

# ✅ 7. HTTPS configurado
curl -i https://seu-dominio.com/health
# Status 200 com headers de segurança
```

---

## 🔐 Headers de Segurança - O que Cada Um Faz

```
Content-Security-Policy
  └─ Bloqueia scripts/recursos não autorizados
  └─ Previne XSS
  └─ Exemplo: `script-src 'self'`

Strict-Transport-Security (HSTS)
  └─ Força navegador usar HTTPS
  └─ Previne man-in-the-middle
  └─ Válido por 1 ano

X-Content-Type-Options: nosniff
  └─ Navegador NÃO interpreta tipo de arquivo
  └─ Previne MIME sniffing

X-Frame-Options: DENY
  └─ Página NÃO pode estar em iframe
  └─ Previne clickjacking

X-XSS-Protection
  └─ Ativa filtro XSS do navegador
  └─ Camada adicional de proteção

Referrer-Policy
  └─ Controla quanto de informação é enviada
  └─ strict-origin-when-cross-origin = seguro
```

---

## 📊 Rate Limiting - Entender os Limites

```javascript
// ⚠️ Login - SEVERO (protege contra força bruta)
{
  rota: '/users/login',
  limite: 5,        // 5 tentativas
  janela: 60 * 1000 // 1 minuto
  // Se passar: HTTP 429 + bloqueado por 1 minuto
}

// Registrar - MODERADO (evita spam de contas)
{
  rota: '/users/registrar',
  limite: 3,                  // 3 tentativas
  janela: 15 * 60 * 1000      // 15 minutos
  // Se passar: HTTP 429 + bloqueado por 15 minutos
}

// API Geral - PADRÃO (proteção contra DoS)
{
  rota: '/*',
  limite: 100,                // 100 requisições
  janela: 15 * 60 * 1000      // 15 minutos
  // Se passar: HTTP 429 + bloqueado temporariamente
}

💡 BASE = IP do cliente
   → Um usuário = um IP = um limite
   → Se tiver proxy, IP pode ser compartilhado
```

---

## 🌐 WebSocket - Como Funciona Agora

```
ANTES (Inseguro):
  Cliente → WebSocket URL com token na query
           ws://localhost:3000?token=xyz
  Servidor → Token visível em logs, proxy, etc ❌

AGORA (Seguro - Pacote P0):
  Cliente → Conecta sem token
           ws://localhost:3000
           + Header: Authorization: Bearer xyz
  Servidor → Valida token no header
            → Rejeita qualquer token na URL
            → Token seguro, não visível ✅

Heartbeat:
  A cada 30 segundos:
    Servidor → PING → Cliente
                       ↓
                      PONG (automático)
                       ↓
    Servidor ← PONG ← Cliente
  
  Se Cliente NÃO responder em 60s:
    → Conexão é terminada (fantasma eliminada)
```

---

## 🧪 Testes - Como Fazer Manualmente

### Teste 1: Verificar Headers
```bash
curl -i http://localhost:3000/health

# Procurar por:
# - content-security-policy: ...
# - strict-transport-security: ...
# - x-frame-options: DENY
# - x-content-type-options: nosniff

echo "Se vir todos os headers acima ✓ = OK"
```

### Teste 2: Rate Limit
```bash
# Fazer 6 requisições rapidamente
for i in {1..6}; do
  echo "Tentativa $i:"
  curl -X POST http://localhost:3000/users/login \
    -H "Content-Type: application/json" \
    -d '{"email":"x","senha":"x"}' 2>/dev/null | jq '.status // .erro' 
  sleep 0.1
done

# Esperado:
# Tentativa 1-5: 401 (credencial inválida)
# Tentativa 6: 429 (bloqueado)
```

### Teste 3: WebSocket Seguro
```javascript
// No console do navegador (DevTools):

// ❌ Teste falho (token na URL)
const ws = new WebSocket('ws://localhost:3000?token=fake');
ws.onopen = () => console.log('Conectado'); // NUNCA vai chamar
ws.onerror = (e) => console.log('Erro:', e); // Vai chamar

// ✅ Teste correto (usando cliente seguro)
// O frontend já faz isso automaticamente
// Basta fazer login e verificar em DevTools:
// Network > WS > Status: 101 Switching Protocols ✓
```

### Teste 4: Heartbeat
```bash
# Ver logs do servidor enquanto conecta:
npm run dev

# Procure por:
# [WebSocket] ✓ Cliente conectado: user@email.com
# [WebSocket] ✓ Heartbeat OK (aparece a cada 30s)
# [WebSocket] Conexão fechada quando desconecta

echo "Se vir isso ✓ = Heartbeat funcionando"
```

---

## ⚙️ Variáveis de Ambiente - Referência

### Backend (.env)
```env
# OBRIGATÓRIO
JWT_SECRET=seu_secret_com_32_caracteres_aleatorios

# IMPORTANTE
NODE_ENV=development           # ou production
CORS_ORIGIN=http://localhost:5173

# OPCIONAL (com defaults)
PORT=3000                      # Default: 3000
HOST=0.0.0.0                   # Default: 0.0.0.0
WEBSOCKET_ENABLED=true         # Default: true
JWT_EXPIRES_IN=7d              # Default: 7d
LOG_LEVEL=debug                # Default: debug
```

### Frontend (.env)
```env
# OPCIONAL (com defaults)
VITE_WEBSOCKET_URL=ws://localhost:3000
```

---

## 🔍 Como Debugar

### 1. Verificar JWT_SECRET
```bash
cat backend/.env | grep JWT_SECRET
# Deve mostrar um secret com 32+ caracteres

# Ou verificar se arquivo .env existe
ls -la backend/.env
```

### 2. Ver Logs de Segurança
```bash
# Iniciar com verbose
NODE_DEBUG=* npm run dev

# Procurar por:
# [SecurityHeaders] Aplicado
# [RateLimit] Tentativa bloqueada
# [WebSocket] Cliente conectado
# [WebSocket] Heartbeat OK
```

### 3. Testar Endpoint Específico
```bash
# Verificar health check
curl -v http://localhost:3000/health

# Verificar rate limit
curl -v -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{}'

# Verificar CORS
curl -v -H "Origin: http://localhost:5173" \
  http://localhost:3000/health
```

### 4. Ver Conexões WebSocket
```bash
# No console do frontend (F12):
console.log('WebSocket conectado:', localStorage.getItem('token') ? 'SIM' : 'NÃO');

# Ou ver no DevTools:
# Network > WS > Messages
# Procurar por ping/pong messages
```

---

## 🚨 Sinais de Alerta

### ❌ Problema: Aplicação não inicia
```
Mensagem: ❌ ERRO CRÍTICO DE SEGURANÇA: JWT_SECRET não definido
Solução: Defina JWT_SECRET em .env
```

### ❌ Problema: Login bloqueado
```
HTTP 429 + "Muitas tentativas"
Solução: Aguarde 1 minuto e tente novamente
IMPORTANTE: Isso é PROPOSITAL - não é erro!
```

### ❌ Problema: WebSocket não conecta
```
DevTools Console: Error connecting WebSocket
Solução: Verificar:
  1. Backend está rodando?
  2. Token valid?
  3. CORS_ORIGIN correto?
```

### ❌ Problema: Headers não aparecem
```
curl -i http://localhost:3000/health
// Não vê headers de segurança
Solução: 
  1. Verificar se securityHeaders.js está importado em app.js
  2. Verificar ordem dos middlewares
  3. Reiniciar servidor
```

---

## 💡 Dicas Pro

### 1. Regenerar JWT_SECRET
```bash
# Gerar novo secret (quando precisar rotacionar)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" > jwt_novo.txt
cat jwt_novo.txt
# Copiar para .env e reiniciar servidor
```

### 2. Monitorar Conexões WebSocket
```bash
# Fazer requisição ao endpoint de stats (admin)
TOKEN="seu_jwt_aqui"
curl http://localhost:3000/monitor/websocket/stats \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 3. Testar em Diferentes Ambientes
```bash
# Development
NODE_ENV=development npm run dev

# Production (mais rigoroso)
NODE_ENV=production npm run dev

# Notar diferenças no relatório de segurança
```

### 4. Backup de Configuração
```bash
# Fazer backup do .env (SEGURO!)
cp backend/.env backend/.env.backup
chmod 600 backend/.env.backup
# Nunca committar .env em git!
```

---

## 📚 Leitura Recomendada

Após implementar tudo:

1. **Entender CSP (Content-Security-Policy)**
   - Leia: [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
   - Teste: [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

2. **Entender HSTS**
   - Leia: [MDN HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)

3. **Entender WebSocket Security**
   - Leia: [OWASP WebSocket](https://owasp.org/www-community/attacks/websocket)

4. **Entender JWT**
   - Leia: [JWT.io](https://jwt.io/)
   - Leia: [RFC 8725](https://tools.ietf.org/html/rfc8725)

---

## ✅ Checklist Rápido

```
Antes de usar em PRODUÇÃO:

[ ] JWT_SECRET tem 32+ caracteres
[ ] NODE_ENV=production em .env
[ ] CORS_ORIGIN aponta para domínio real
[ ] WebSocket em WSS (com HTTPS)
[ ] Testes passando: node backend/security-tests.js
[ ] Nenhuma senha/secret commitada em git
[ ] HTTPS/SSL certificado configurado
[ ] Monitores/alertas configurados
[ ] Backup de .env em local seguro
[ ] Log de segurança sendo monitorado
```

---

## 🎯 Último Conselho

> **"Security is not a feature, it's a requirement."**

Você implementou Pacote P0 - Excelente! 🎉

Mas lembre-se:
- ✅ Segurança não é "fire and forget"
- ✅ Mantenha dependências atualizadas
- ✅ Monitore logs regularmente
- ✅ Faça testes de segurança periodicamente
- ✅ Eduque sua equipe sobre boas práticas

---

**Dúvidas?** Leia [SECURITY_P0_IMPLEMENTATION.md](SECURITY_P0_IMPLEMENTATION.md)

**Pronto?** Execute `npm run dev`!

🔐 **Seu sistema está seguro!**
