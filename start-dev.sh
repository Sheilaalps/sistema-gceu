#!/bin/bash
# 🚀 Script para iniciar o sistema GCEU em desenvolvimento

echo "=========================================="
echo "  🎯 GCEU - Sistema de Gestão"
echo "  Iniciando desenvolvimento..."
echo "=========================================="
echo ""

# Cores para terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Node está instalado
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js não está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js encontrado: $(node --version)${NC}"
echo ""

# Backend
echo -e "${BLUE}📦 Iniciando Backend...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependências do backend..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "⚠️  Criando .env do backend (use .env.example como base)"
    cp .env.example .env
fi

# Popular banco se ainda não foi feito
if [ ! -f ".seed-completed" ]; then
    echo "🌱 Populando banco de dados..."
    npm run seed
    touch .seed-completed
fi

# Iniciar backend em background
echo -e "${GREEN}✅ Backend iniciando em http://localhost:3000${NC}"
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
echo ""

# Frontend
echo -e "${BLUE}🎨 Iniciando Frontend...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependências do frontend..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "⚠️  Criando .env do frontend (use .env.example como base)"
    cp .env.example .env
fi

echo -e "${GREEN}✅ Frontend iniciando em http://localhost:5173${NC}"
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
echo ""

# Instruções finais
echo "=========================================="
echo -e "${GREEN}🚀 TUDO PRONTO!${NC}"
echo "=========================================="
echo ""
echo "📍 Acesse a aplicação:"
echo "   🎨 Frontend: http://localhost:5173"
echo "   📦 Backend:  http://localhost:3000"
echo ""
echo "🔐 Credenciais padrão:"
echo "   Email: admin@gceu.com"
echo "   Senha: senha123"
echo ""
echo "📚 Documentação:"
echo "   • Setup: SETUP_GUIDE.md"
echo "   • Correções: CORREÇÕES_APLICADAS.md"
echo "   • Testes: CHECKLIST_TESTES.md"
echo ""
echo "🛑 Para parar os servidores:"
echo "   kill $BACKEND_PID  (Backend)"
echo "   kill $FRONTEND_PID (Frontend)"
echo ""
echo "=========================================="

# Manter script rodando
wait
