# 🧪 Guia de Teste - Site + Sistema

## ✅ Checklist de Verificação

Execute os testes abaixo para confirmar que tudo está funcionando:

---

## 1️⃣ TESTE DA PÁGINA INICIAL (SITE)

### Passo 1: Iniciar o projeto
```bash
cd frontend
npm run dev
```

### Passo 2: Acessar Home
```
URL: http://localhost:5173/
```

### Verificações ✅
- [ ] Banner GCEU aparece no topo com logo colorido
  - [ ] Letra G em branco
  - [ ] Letra C em amarelo/laranja
  - [ ] Letra E em vinho
  - [ ] Letra U em azul
- [ ] Subtítulo "GRUPO DE CRESCIMENTO, EVANGELIZAÇÃO E UNIDADE" aparece
- [ ] "Até a última casa" aparece
- [ ] 4 Cards aparecem abaixo do banner:
  - [ ] "🏠 O que é o GCEU?"
  - [ ] "🤝 Nossa Missão"
  - [ ] "🌱 Como Participar"
  - [ ] "📈 Liderança"
- [ ] Gaveta NEWS apareça no lado direito (hover)
  - [ ] Passe o mouse no "NEWS" (lado direito da tela)
  - [ ] Gaveta desliza para dentro
  - [ ] Mostra 3 notícias
- [ ] Footer aparece no rodapé
  - [ ] Logo GCEU colorido
  - [ ] "Navegação" com links
  - [ ] "Dúvidas?" com email
  - [ ] Copyright aparece

---

## 2️⃣ TESTE DE NAVEGAÇÃO DO SITE

### Verificações ✅
- [ ] Clicar em "Home" no footer volta para home
- [ ] Clicar em "Casas de Paz" no footer (funciona ou mostra mensagem)
- [ ] Clicar em "Administrador" no footer leva a /login
- [ ] Email "suporte.gceu@email.com" abre cliente de email

---

## 3️⃣ TESTE DE RESPONSIVIDADE

### Desktop (1920px)
- [ ] Todos os componentes aparecem
- [ ] Layout é clean

### Tablet (768px)
- [ ] Components se ajustam
- [ ] Gaveta NEWS ainda funciona

### Mobile (375px)
- [ ] Banner redimensiona
- [ ] Cards ficam em 1 coluna
- [ ] Gaveta NEWS ainda acessível

---

## 4️⃣ TESTE DE LOGIN

### Passo 1: Acessar Login
```
URL: http://localhost:5173/login
```

### Verificações ✅
- [ ] Página de login aparece
- [ ] Campos de email e senha aparecem
- [ ] Botão "Entrar" aparece

### Passo 2: Fazer Login
```
Email: admin@gceu.com
Senha: senha123
```

### Verificações ✅
- [ ] Login bem-sucedido
- [ ] Redirecionado para /dashboard
- [ ] Cookie "token" é setado (verificar DevTools → Application → Cookies)

---

## 5️⃣ TESTE DO DASHBOARD

### URL
```
http://localhost:5173/dashboard
```

### Verificações ✅
- [ ] Bem-vindo com nome do usuário aparece
- [ ] Nível de acesso (ADMIN) aparece
- [ ] Botão "Sair" aparece
- [ ] Cards de estatísticas aparecem:
  - [ ] Total de Membros
  - [ ] Membros Ativos
  - [ ] (Se admin) Ausentes
  - [ ] (Se admin) Visitantes
- [ ] Números aparecem corretamente
- [ ] Links para Membros e Admin aparecem

---

## 6️⃣ TESTE DE MEMBROS

### URL
```
http://localhost:5173/membros
```

### Verificações ✅
- [ ] Listagem de membros aparece
- [ ] Tabela com colunas: Nome, Telefone, Status, Última Presença, Ações
- [ ] Pelo menos 1 membro listado
- [ ] Botão "Novo Membro" aparece (se admin)
- [ ] Botões de ação aparecem:
  - [ ] Editar
  - [ ] Presença
  - [ ] Deletar (só admin)

---

## 7️⃣ TESTE DE PROTEÇÃO DE ROTAS

### Teste 1: Sem autenticação
```
1. Abra nova aba anônima
2. URL: http://localhost:5173/dashboard
```

Verificações ✅
- [ ] Redireciona para /login automaticamente

### Teste 2: Token inválido
```
1. DevTools → Application → Cookies
2. Delete cookie "token"
3. Tente acessar /membros
```

Verificações ✅
- [ ] Redireciona para /login automaticamente

---

## 8️⃣ TESTE DE LOGOUT

### Passo 1: Estar no Dashboard
```
URL: http://localhost:5173/dashboard
```

### Passo 2: Clicar em "Sair"
### Verificações ✅
- [ ] Botão "Sair" funciona
- [ ] Cookie "token" é removido
- [ ] Redireciona para /login

---

## 9️⃣ TESTE DE CONSOLE

### Abra DevTools (F12)
### Verificações ✅
- [ ] Sem erros em vermelho no console
- [ ] Sem warnings graves

---

## 🔟 TESTE DE PERFORMANCE

### Verificações ✅
- [ ] Home carrega em < 2 segundos
- [ ] Dashboard carrega em < 1 segundo
- [ ] Sem lags ao navegar
- [ ] Gaveta NEWS abre suavemente

---

## 📋 Teste Completo (Fluxo Inteiro)

```
1. Acesse http://localhost:5173/ ← Home pública
2. Visualize banner, cards, footer
3. Passe mouse no NEWS (gaveta apareça)
4. Clique em "Administrador" no footer
5. Faça login
6. Dashboard apareça
7. Acesse /membros
8. Visualize membros
9. Clique "Sair"
10. Volte para /login
11. Acesse Home novamente
```

---

## 🎯 Resultado Esperado

Todos os ✅ checados significam que:

```
✅ Site público funciona
✅ Sistema privado funciona
✅ Autenticação funciona
✅ Rotas protegidas funcionam
✅ Logout funciona
✅ Responsividade OK
✅ Performance OK
✅ TUDO PRONTO! 🚀
```

---

## 🐛 Se Algo Não Funcionar

### Problema: Banner não aparece
**Solução**: 
```bash
# Limpar cache
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Problema: Gaveta NEWS não abre
**Solução**: 
```css
/* Verificar em DevTools se a classe info-section existe */
/* Tente fazer hover no lado direito da tela */
```

### Problema: Login não funciona
**Solução**:
```
1. Verifique se backend está rodando (porta 3000)
2. Verifique credenciais
3. Abra DevTools → Network → veja erro
```

### Problema: Redireciona para login mesmo autenticado
**Solução**:
```
1. Limpar cookies: DevTools → Application → Cookies → Delete
2. Fazer login novamente
3. Verificar se token foi setado
```

---

## ✨ Conclusão

Se todos os testes passarem, seu sistema está:

```
🎉 Site funcionando
🎉 Sistema funcionando
🎉 Autenticação segura
🎉 Rotas protegidas
🎉 Pronto para uso!
```

**Próximo passo**: Implementar os componentes de CRUD do [MELHORIAS_RAPIDAS.md](../../MELHORIAS_RAPIDAS.md)

---

**Boa sorte nos testes! 🚀**

