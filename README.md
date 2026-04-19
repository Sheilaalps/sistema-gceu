# 🎯 GCEU - Sistema de Gestão de Pequenos Grupos

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento%20-yellow?style=flat-square)
![Version](https://img.shields.io/badge/Version-0.2.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> Sistema completo para gestão de membros, cargos e atividades de grupos familiares (GCEU - Grupo de Crescimento, Evangelização e Unidade).

## 📋 Sobre o Projeto

O GCEU é uma aplicação web moderna que permite:
- 👥 Gerenciar membros de grupos familiares
- 📝 Registrar presença em reuniões
- 🔐 Controlar permissões de usuários (admin, lider, anfitriao)
- 📊 Visualizar estatísticas e relatórios
- 📱 Interface responsiva e intuitiva

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** + Express.js
- **Prisma ORM** para gerenciamento de banco
- **PostgreSQL** (via Supabase)
- **JWT** para autenticação segura
- **bcryptjs** para criptografia de senhas
- **Zod** para validação de dados

### Frontend
- **React 19** com JSX
- **Vite** para build e dev server
- **React Router v6** para roteamento
- **Axios** para chamadas HTTP
- **Context API** para gerenciamento de estado

## 📦 Estrutura do Projeto

```
sistema-gceu/
├── backend/
│   ├── bin/www                 # Entry point
│   ├── middleware/             # Autenticação, validação, criptografia
│   ├── routes/                 # Rotas da API
│   ├── prisma/                 # Schema e seed do BD
│   ├── app.js                  # Configuração Express
│   ├── .env                    # Variáveis de ambiente
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/              # Login, Dashboard, Membros, Admin
│   │   ├── components/         # Sidebar, Banner, Footer, etc
│   │   ├── Service/            # API calls e serviços
│   │   ├── context/            # Auth context e rotas protegidas
│   │   ├── routes/             # Roteamento principal
│   │   ├── App.jsx             # Componente raiz
│   │   └── main.jsx            # Entry point
│   ├── vite.config.js
│   ├── .env
│   └── package.json
│
├── SETUP_GUIDE.md              # Guia de instalação
├── CORREÇÕES_APLICADAS.md      # Resumo de correções
├── CHECKLIST_TESTES.md         # Testes a executar
└── verify-setup.js             # Script de verificação
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js v16+
- npm ou yarn
- PostgreSQL (ou Supabase)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/Sheilaalps/sistema-gceu.git
cd sistema-gceu
```

2. **Configure o Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edite .env com suas credenciais
npm run seed        # Popular BD com dados iniciais
npm run dev         # Inicia em http://localhost:3000
```

3. **Configure o Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev         # Inicia em http://localhost:5173
```

4. **Acesse a aplicação**
Abra http://localhost:5173 no seu navegador

## 🔐 Credenciais Padrão

| Email | Senha | Nível |
|-------|-------|-------|
| admin@gceu.com | senha123 | admin |
| lider@gceu.com | senha123 | lider |
| anfitriao@gceu.com | senha123 | anfitriao |

⚠️ Altere as senhas após o primeiro acesso

## 📚 Documentação

- [**SETUP_GUIDE.md**](./SETUP_GUIDE.md) - Guia completo de instalação e configuração
- [**CORREÇÕES_APLICADAS.md**](./CORREÇÕES_APLICADAS.md) - Resumo de todas as correções implementadas
- [**CHECKLIST_TESTES.md**](./CHECKLIST_TESTES.md) - Testes a serem executados

## 🔌 API Endpoints

### Autenticação
```
POST   /users/login       - Fazer login
POST   /users/registrar   - Criar novo usuário (admin)
GET    /users/perfil      - Obter perfil autenticado
```

### Membros
```
GET    /membros                    - Listar com paginação
GET    /membros/:id                - Obter específico
POST   /membros                    - Criar novo
PUT    /membros/:id                - Atualizar
DELETE /membros/:id                - Deletar
POST   /membros/:id/presenca       - Registrar presença
GET    /membros/status/:status     - Filtrar por status
```

*Todas as rotas requerem autenticação (Bearer token)*

## 🔒 Segurança

✅ Implementado:
- Autenticação JWT (7 dias expiration)
- Criptografia de senhas com bcryptjs
- CORS configurado
- Validação de dados com Zod
- Proteção por nível de permissão

⚠️ Em Desenvolvimento:
- Rate limiting
- HTTPS em produção
- Testes de segurança
- Logs estruturados

## 📊 Status das Funcionalidades

| Funcionalidade | Status | Progresso |
|---|---|---|
| Autenticação | ✅ Pronto | 100% |
| CRUD Usuários | ✅ Pronto | 100% |
| CRUD Membros | ✅ Pronto | 100% |
| Dashboard | ✅ Pronto | 90% |
| Presença | 🟡 Parcial | 70% |
| Admin Panel | 🟡 Parcial | 60% |
| Relatórios | 🔴 TODO | 0% |
| Casas de Paz | 🔴 TODO | 0% |

## 🧪 Testes

Execute os testes:

```bash
# Backend
cd backend
npm test

# Frontend
cd ../frontend
npm test
```

Veja [CHECKLIST_TESTES.md](./CHECKLIST_TESTES.md) para testes manuais.

## 🐛 Troubleshooting

**Erro: "Conexão com banco recusada"**
- Verificar se DATABASE_URL está correto em `.env`

**Erro: "Token inválido"**
- Fazer novo login ou limpar localStorage

**Erro: "CORS error"**
- Verificar se CORS_ORIGIN está configurado para porta correta

Veja [SETUP_GUIDE.md](./SETUP_GUIDE.md#-troubleshooting) para mais soluções.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- 📧 suporte.gceu@email.com
- 💬 Discord: [Link do servidor]
- 🐛 Issues: [GitHub Issues](https://github.com/Sheilaalps/sistema-gceu/issues)

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](./LICENSE) para detalhes.

## 👨‍💻 Desenvolvido por

**Sheila Araújo**
- GitHub: [@Sheilaalps](https://github.com/Sheilaalps)
- Email: suporte.gceu@email.com

## 🙏 Agradecimentos

- React e Vite pela excelente stack de desenvolvimento
- Prisma pelo ORM elegante
- Supabase pelo banco de dados gerenciado

---

<div align="center">

**[⬆ voltar para o topo](#-gceu---sistema-de-gestão-de-pequenos-grupos)**

Desenvolvido com ❤️ para a comunidade GCEU

</div>
