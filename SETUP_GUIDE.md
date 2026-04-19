# 📋 Guia de Setup - GCEU System

## ⚙️ Configuração do Backend

### Pré-requisitos
- Node.js (v16+)
- npm ou yarn
- PostgreSQL (ou acesso ao Supabase)

### Instalação

1. **Navegar até o diretório do backend**
```bash
cd backend
```

2. **Instalar dependências**
```bash
npm install
```

3. **Configurar variáveis de ambiente**
```bash
cp .env.example .env
# Editar .env com suas credenciais do banco de dados
```

4. **Executar migrations do Prisma**
```bash
npm run prisma:push
```

5. **Popuar o banco com dados iniciais (seed)**
```bash
npm run seed
```

6. **Iniciar o servidor em desenvolvimento**
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

### Scripts Disponíveis
- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia com nodemon (recarregamento automático)
- `npm run seed` - Popula banco com dados iniciais
- `npm run prisma:push` - Sincroniza schema com banco

---

## 🎨 Configuração do Frontend

### Pré-requisitos
- Node.js (v16+)
- npm ou yarn

### Instalação

1. **Navegar até o diretório do frontend**
```bash
cd frontend
```

2. **Instalar dependências**
```bash
npm install
```

3. **Configurar variáveis de ambiente**
```bash
cp .env.example .env
# Editar .env com URL do backend (padrão: http://localhost:3000)
```

4. **Iniciar servidor de desenvolvimento**
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:5173`

### Scripts Disponíveis
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build para produção
- `npm run preview` - Visualiza build de produção localmente
- `npm run lint` - Executa linter ESLint

---

## 🔐 Credenciais Padrão (Seed)

Após executar o seed, você pode usar:

| Email | Senha | Nível |
|-------|-------|-------|
| admin@gceu.com | senha123 | admin |
| lider@gceu.com | senha123 | lider |
| anfitriao@gceu.com | senha123 | anfitriao |

⚠️ **Altere essas senhas em produção!**

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas

#### `usuarios`
- `id` (INT, PK)
- `nome` (VARCHAR 100)
- `email` (VARCHAR 100, UNIQUE)
- `senha` (VARCHAR 255) - Criptografada com bcrypt
- `nivel` (ENUM: admin, lider, anfitriao)

#### `membros`
- `id` (INT, PK)
- `nome` (VARCHAR 100)
- `telefone` (VARCHAR 20)
- `endereco` (VARCHAR 255)
- `data_nascimento` (DATE)
- `status` (ENUM: ativo, ausente, visitante)
- `ultima_presenca` (DATE)
- `data_cadastro` (TIMESTAMP)

---

## 🚀 Endpoints da API

### Autenticação

#### POST `/users/login`
Fazer login no sistema
```json
{
  "email": "admin@gceu.com",
  "senha": "senha123"
}
```
**Retorno:**
```json
{
  "id": 1,
  "nome": "Sheila",
  "nivel": "admin",
  "token": "eyJhbGc..."
}
```

#### GET `/users/perfil`
Obter perfil do usuário autenticado
**Headers:** `Authorization: Bearer {token}`

---

### Membros

#### GET `/membros`
Listar membros com paginação
**Query params:** `pagina=1&limite=10`

#### GET `/membros/:id`
Obter detalhes de um membro

#### POST `/membros`
Criar novo membro (admin/lider)
```json
{
  "nome": "João Silva",
  "telefone": "(11) 91234-5678",
  "endereco": "Rua A, 123",
  "data_nascimento": "1990-05-15",
  "status": "ativo"
}
```

#### PUT `/membros/:id`
Atualizar membro (admin/lider)

#### DELETE `/membros/:id`
Deletar membro (admin only)

#### POST `/membros/:id/presenca`
Registrar presença do membro (admin/lider)

#### GET `/membros/status/:status`
Buscar membros por status (ativo/ausente/visitante)

---

## 🔒 Segurança

✅ **Implementado:**
- Criptografia de senhas com bcryptjs
- JWT para autenticação
- CORS configurado
- Validação de dados com Zod
- Proteção de rotas por nível de permissão

⚠️ **TODO:**
- Rate limiting
- HTTPS em produção
- Logs estruturados
- Testes de segurança

---

## 🐛 Troubleshooting

### "Conexão com banco recusada"
- Verificar se DATABASE_URL está correto no `.env`
- Testar conexão: `npx prisma db execute --stdin < /dev/null`

### "Token inválido"
- Verificar se JWT_SECRET está igual em frontend e backend
- Token expira em 7 dias

### "CORS error"
- Verificar se CORS_ORIGIN está configurado para `http://localhost:5173`

---

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 suporte.gceu@email.com
- 💬 Abra uma issue no GitHub

---

Desenvolvido com ❤️ por Sheila Araújo
