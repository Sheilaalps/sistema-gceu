#!/usr/bin/env node

/**
 * 🧪 Verificador de Setup - GCEU System
 * Execute este script para verificar se tudo está configurado corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 VERIFICANDO SETUP DO SISTEMA GCEU...\n');

const checks = {
  backend: [],
  frontend: [],
};

// Verificações do Backend
console.log('📦 Verificando Backend...\n');

const backendDir = path.join(__dirname, 'backend');
const backendChecks = [
  { file: 'package.json', name: 'package.json' },
  { file: '.env', name: '.env configurado' },
  { file: 'app.js', name: 'app.js configurado' },
  { file: 'prisma/schema.prisma', name: 'Schema Prisma' },
  { file: 'middleware/auth.js', name: 'Middleware de Auth' },
  { file: 'middleware/criptografia.js', name: 'Middleware de Criptografia' },
  { file: 'middleware/validations.js', name: 'Middleware de Validações' },
  { file: 'routes/users.js', name: 'Rotas de Usuários' },
  { file: 'routes/membros.js', name: 'Rotas de Membros' },
  { file: 'prisma/seed.js', name: 'Script de Seed' },
];

backendChecks.forEach((check) => {
  const filePath = path.join(backendDir, check.file);
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${check.name}`);
  checks.backend.push(exists);
});

// Verificações do Frontend
console.log('\n🎨 Verificando Frontend...\n');

const frontendDir = path.join(__dirname, 'frontend');
const frontendChecks = [
  { file: 'package.json', name: 'package.json' },
  { file: 'src/App.jsx', name: 'App.jsx' },
  { file: 'src/routes/AppRoutes.jsx', name: 'AppRoutes.jsx' },
  { file: 'src/context/AuthContext.jsx', name: 'AuthContext.jsx' },
  { file: 'src/pages/Login.jsx', name: 'Login.jsx' },
  { file: 'src/pages/Dashboard.jsx', name: 'Dashboard.jsx' },
  { file: 'src/pages/Membros.jsx', name: 'Membros.jsx' },
  { file: 'src/Service/api.js', name: 'api.js' },
  { file: 'src/Service/usuarioService.js', name: 'usuarioService.js' },
  { file: 'src/Service/membroService.js', name: 'membroService.js' },
];

frontendChecks.forEach((check) => {
  const filePath = path.join(frontendDir, check.file);
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${check.name}`);
  checks.frontend.push(exists);
});

// Resumo
console.log('\n📊 RESUMO:\n');
const backendOk = checks.backend.filter(Boolean).length;
const frontendOk = checks.frontend.filter(Boolean).length;

console.log(`Backend: ${backendOk}/${checks.backend.length} arquivos OK`);
console.log(`Frontend: ${frontendOk}/${checks.frontend.length} arquivos OK`);

const totalOk = backendOk + frontendOk;
const totalExpected = checks.backend.length + checks.frontend.length;
const percentage = ((totalOk / totalExpected) * 100).toFixed(0);

console.log(`\nTotal: ${totalOk}/${totalExpected} (${percentage}%)\n`);

if (totalOk === totalExpected) {
  console.log('✅ SETUP COMPLETO! Você está pronto para começar.\n');
  console.log('🚀 Próximos passos:');
  console.log('   1. Backend: npm run seed');
  console.log('   2. Backend: npm run dev');
  console.log('   3. Frontend: npm run dev');
  console.log('   4. Abra http://localhost:5173\n');
} else {
  console.log(
    '⚠️  Alguns arquivos estão faltando. Verifique as verificações acima.\n'
  );
}
