# 🚀 QUICK START - Pacote P0 de Segurança

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Backend Setup

```bash
# Navegar para backend
cd backend

# Instalar dependências (já feito, mas confirme)
npm install

# Criar .env com JWT_SECRET seguro
# Windows PowerShell:
$secret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Count 32 | ForEach-Object { [char]$_ })))
echo "JWT_SECRET=$secret" > .env

# OU Linux/Mac:
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))" > .env
cat .env  # Verificar

# Adicionar mais variáveis (opcional)
echo "CORS_ORIGIN=http://localhost:5173" >> .env
echo "NODE_ENV=development" >> .env
echo "PORT=3000" >> .env

# Iniciar servidor
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
✓ Rate Limit Login: 5/min
```

---

### 2️⃣ Frontend Setup

```bash
# Em outro terminal, navegar para frontend
cd frontend

# Instalar dependências
npm install

# Criar .env
echo "VITE_WEBSOCKET_URL=ws://localhost:3000" > .env

# Iniciar dev server
npm run dev
```

**Output esperado:**
```
  ➜  Local:   http://localhost:5173/
```

---

## ✅ Testes Rápidos

### Teste 1: Rate Limiting

```bash
# Terminal 3 - Simular 6 requisições de login em 1 minuto
for i in {1..6}; do
  echo "Tentativa $i:"
  curl -X POST http://localhost:3000/users/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","senha":"123456"}' \
    2>/dev/null | jq .
  sleep 0.5
done

# ✅ Esperado: A 6ª retorna 429 Too Many Requests
```

### Teste 2: Headers de Segurança

```bash
curl -i http://localhost:3000/health

# ✅ Esperado: headers presentes
# content-security-policy
# strict-transport-security
# x-content-type-options
# x-frame-options
```

### Teste 3: WebSocket Seguro

```bash
# ❌ Tentar token na URL (deve falhar)
websocat 'ws://localhost:3000?token=fake' 2>&1 | head -5
# Result: HTTP/1.1 401 Unauthorized

# ✅ Conectar com header (deve funcionar)
# Use o frontend em http://localhost:5173
# Faça login e veja WebSocket conectar
```

### Teste 4: Monitor - Health Check

```bash
curl http://localhost:3000/health | jq .

# ✅ Resposta:
# {
#   "status": "ok",
#   "timestamp": "2024-04-17T10:30:00.000Z",
#   "environment": "development"
# }
```

---

## 📊 Endpoints de Monitoramento

### Health Check (Público)

```bash
GET http://localhost:3000/health
```

### Estatísticas WebSocket (Admin)

```bash
# Primeiro fazer login para obter token
TOKEN="seu_token_aqui"

curl http://localhost:3000/monitor/websocket/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-04-17T10:30:00Z",
  "websocket": {
    "totalConnections": 1,
    "clients": [
      {
        "userId": 1,
        "email": "user@example.com",
        "connectedAt": "2024-04-17T10:28:00Z",
        "isAlive": true
      }
    ]
  }
}
```

---

## 🔒 Verificação de Segurança

```bash
# 1. Verificar JWT_SECRET configurado
cat backend/.env | grep JWT_SECRET
# ✅ Deve mostrar uma string com 64+ caracteres

# 2. Verificar headers de segurança
curl -i http://localhost:3000/health | grep -E "content-security|x-frame|x-content"
# ✅ Deve retornar headers

# 3. Testar rate limit
for i in {1..6}; do 
  curl -s http://localhost:3000/users/login \
    -H "Content-Type: application/json" \
    -d '{}' | jq .status
done
# ✅ Último deve ser 429

# 4. Testar WebSocket
# Abra browser em http://localhost:5173 e faça login
# DevTools > Network > WS
# ✅ Deve ver "101 Switching Protocols"
```

---

## 📁 Arquivos Criados/Modificados

### Backend
```
backend/
├── .env                              [NOVO] Variáveis de ambiente
├── middleware/
│   ├── securityHeaders.js            [NOVO] Headers HTTP rigorosos
│   └── rateLimitAuth.js              [NOVO] Rate limiting anti-força bruta
├── config/
│   └── securityConfig.js             [NOVO] Validação de segurança P0
├── websocket/
│   ├── wsManager.js                  [NOVO] Gerenciador WebSocket
│   └── wsGlobal.js                   [NOVO] Singleton WebSocket
├── routes/
│   ├── users.js                      [MODIFICADO] Com rate limiter
│   └── monitor.js                    [NOVO] Endpoints de monitoramento
├── app.js                            [MODIFICADO] Com middlewares P0
├── bin/www                           [MODIFICADO] Com WebSocket init
└── package.json                      [VERIFICAR] Dependências instaladas
```

### Frontend
```
frontend/
├── .env                              [NOVO] URL do WebSocket
├── src/
│   ├── Service/
│   │   ├── WebSocketClient.js        [NOVO] Cliente WebSocket seguro
│   │   └── useWebSocket.js           [NOVO] Hook React
│   ├── context/
│   │   └── AuthContext.jsx           [MODIFICADO] Com WebSocket
│   └── components/
│       └── WebSocketExample.jsx      [NOVO] Exemplo de uso
```

### Root
```
├── SECURITY_P0_IMPLEMENTATION.md     [NOVO] Documentação completa
└── QUICK_START.md                    [NOVO] Este arquivo
```

---

## 🐛 Troubleshooting

### Erro: "JWT_SECRET não definido"

```bash
# Solução: Definir variável
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))" >> backend/.env
npm run dev
```

### Erro: "Port 3000 already in use"

```bash
# Solução: Mudar porta em .env
echo "PORT=3001" >> backend/.env
npm run dev
```

### WebSocket não conecta

```bash
# Verificar:
1. Frontend e backend rodando? (npm run dev em ambos)
2. .env do frontend tem VITE_WEBSOCKET_URL? 
3. Console do navegador mostra erro? (F12 > Console)
4. Token sendo enviado? (F12 > Network > WS)
```

### Taxa de requisições muito restritiva

```bash
# Editar: backend/config/securityConfig.js
rateLimit: {
  loginAttempts: 10,  // Aumentar de 5 para 10
}
npm run dev
```

---

## 📚 Documentação Completa

Leia `SECURITY_P0_IMPLEMENTATION.md` para:
- ✅ Explicação detalhada de cada requisito
- 🔒 Como funciona cada implementação
- 🧪 Como testar cada funcionalidade
- 📊 Checklist de produção
- 🆘 Troubleshooting completo

---

## ⏱️ Próximos Passos

1. ✅ Rode os testes acima para validar
2. 📖 Leia `SECURITY_P0_IMPLEMENTATION.md`
3. 🧪 Teste em seu navegador: `http://localhost:5173`
4. 🚀 Prepare para produção (veja seção "Produção" na documentação)
5. 📊 Configure monitoramento com os endpoints de monitor

---

## 🎯 Checklist Antes de Produção

- [ ] JWT_SECRET tem 32+ caracteres aleatórios
- [ ] NODE_ENV=production em .env
- [ ] CORS_ORIGIN aponta apenas para seu domínio
- [ ] WebSocket em WSS (wss://) com HTTPS
- [ ] Testes de rate limiting passando
- [ ] Testes de WebSocket passando
- [ ] Logs de segurança sendo monitorados
- [ ] Backup do .env em local seguro
- [ ] SSL/TLS configurado

---

**Pronto para começar? Execute:**

```bash
cd backend && npm run dev &
cd frontend && npm run dev
```

Depois abra: `http://localhost:5173`

🎉 Seu sistema está blindado com o Pacote P0!
