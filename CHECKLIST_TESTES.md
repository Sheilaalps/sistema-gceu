# 🧪 Checklist de Testes - GCEU System

## ✅ Testes de Setup

- [x] Verificador de setup passou (verify-setup.js)
- [x] Todos os arquivos criados
- [x] Todas as dependências instaladas
- [x] .env configurado
- [x] Middleware de segurança criado

## ✅ Testes de Backend

### Autenticação
- [ ] POST /users/login com credenciais válidas
- [ ] POST /users/login com credenciais inválidas
- [ ] GET /users/perfil com token válido
- [ ] GET /users/perfil com token inválido
- [ ] POST /users/registrar como admin

### Membros - Listagem
- [ ] GET /membros retorna lista com paginação
- [ ] GET /membros?pagina=1&limite=5 funciona
- [ ] GET /membros/:id retorna membro específico
- [ ] GET /membros/status/ativo filtra por status

### Membros - CRUD
- [ ] POST /membros cria novo membro (lider)
- [ ] PUT /membros/:id atualiza membro (lider)
- [ ] DELETE /membros/:id deleta membro (admin only)
- [ ] POST /membros/:id/presenca registra presença

### Proteção de Rotas
- [ ] GET /membros sem token retorna erro 401
- [ ] POST /membros com nível anfitriao retorna erro 403
- [ ] POST /users/registrar sem nível admin retorna erro 403

## ✅ Testes de Frontend

### Página de Login
- [ ] Página carrega com formulário
- [ ] Login com credenciais válidas redireciona para dashboard
- [ ] Login com credenciais inválidas mostra erro
- [ ] Validação de email obrigatório
- [ ] Validação de senha obrigatória

### Dashboard
- [ ] Exibe nome do usuário logado
- [ ] Exibe nível de permissão
- [ ] Mostra estatísticas de membros
- [ ] Botão Sair faz logout
- [ ] Mostra módulos baseado no nível de permissão

### Página de Membros
- [ ] Carrega lista de membros
- [ ] Paginação funciona
- [ ] Status exibe com cor correta
- [ ] Tabela responsiva em mobile
- [ ] Botão "Novo Membro" aparece para lider/admin

### Proteção de Rotas
- [ ] Usuário não autenticado é redirecionado para login
- [ ] Usuário anfitriao não acessa /admin
- [ ] Token é mantido após refresh
- [ ] Logout remove token

## ✅ Testes de Integração

### API + Frontend
- [ ] Frontend consegue fazer login e recebe token
- [ ] Token é enviado em Authorization header
- [ ] Dados de membros são carregados do backend
- [ ] Erro de autenticação exibe mensagem apropriada

### Banco de Dados
- [ ] Seed popula usuários e membros
- [ ] Senhas são armazenadas criptografadas
- [ ] Email unique constraint funciona
- [ ] Datas são armazenadas corretamente

## 🔐 Testes de Segurança

- [ ] Senhas em plain text NÃO aparecem em logs
- [ ] JWT token expira em 7 dias
- [ ] CORS rejeita origem não permitida
- [ ] Validação Zod rejeita dados inválidos
- [ ] SQL injection não funciona
- [ ] XSS prevention no frontend

## 📊 Testes de Performance

- [ ] Frontend carrega em < 3 segundos
- [ ] Paginação com 1000+ membros não trava
- [ ] Login responde em < 1 segundo
- [ ] Seed completa em < 5 segundos

## ✨ Testes de UX

- [ ] Botões estão alinhados e responsivos
- [ ] Mensagens de erro são claras
- [ ] Mensagens de sucesso são visíveis
- [ ] Loading states aparecem durante requisições
- [ ] Cores estão consistentes com a marca GCEU
- [ ] Fonts são legíveis em todos os tamanhos

## 📋 Como Executar Testes

### Backend
```bash
# Testar endpoint GET /membros
curl -H "Authorization: Bearer seu-token" http://localhost:3000/membros

# Testar login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gceu.com","senha":"senha123"}'
```

### Frontend
```bash
# Abrir DevTools (F12)
# Verificar console para erros
# Testar todas as rotas manualmente
```

## 🐛 Bugs Conhecidos

- [ ] Prisma db push pode falhar em primeira execução (usar seed como alternativa)
- [ ] [ ] CORS pode precisar ajuste se frontend estiver em domínio diferente

## 📝 Notas

- Todas as rotas requerem autenticação exceto /users/login
- Níveis: admin > lider > anfitriao
- Admin pode fazer tudo
- Lider pode criar/editar membros e registrar presença
- Anfitriao pode visualizar membros

---

**Status**: ✅ Pronto para testes
**Data**: 17 de Abril de 2026
**Desenvolvedor**: Sheila Araújo
