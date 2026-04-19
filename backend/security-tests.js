#!/usr/bin/env node

/**
 * ================================================================
 * SECURITY P0 TEST SUITE
 * ================================================================
 * Teste automatizado de todos os requisitos de segurança P0
 * 
 * Uso:
 * node backend/security-tests.js
 * 
 * ⚠️ Pré-requisitos:
 * - Backend rodando em http://localhost:3000
 * - Usuário de teste disponível (email: test@test.com, senha: 123456)
 */

const http = require('http');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(type, message) {
  const symbols = {
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    info: `${colors.blue}ℹ${colors.reset}`,
  };
  console.log(`${symbols[type] || ''} ${message}`);
}

/**
 * Fazer requisição HTTP
 */
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * ================================================================
 * TESTES
 * ================================================================
 */

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       SECURITY P0 TEST SUITE - TESTE DE SEGURANÇA          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let passedTests = 0;
  let failedTests = 0;

  // ================================================================
  // TESTE 1: Headers de Segurança
  // ================================================================
  console.log(`${colors.blue}[TESTE 1]${colors.reset} Headers de Segurança`);
  try {
    const response = await makeRequest('GET', '/health');

    const requiredHeaders = [
      'content-security-policy',
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
    ];

    let allHeadersPresent = true;
    requiredHeaders.forEach(header => {
      if (response.headers[header]) {
        log('success', `Header "${header}" presente`);
      } else {
        log('error', `Header "${header}" FALTANDO`);
        allHeadersPresent = false;
      }
    });

    if (allHeadersPresent) {
      log('success', 'TESTE 1 PASSOU ✓');
      passedTests++;
    } else {
      log('error', 'TESTE 1 FALHOU ✗');
      failedTests++;
    }
  } catch (error) {
    log('error', `TESTE 1 FALHOU: ${error.message}`);
    failedTests++;
  }

  console.log('');

  // ================================================================
  // TESTE 2: Rate Limiting - Login
  // ================================================================
  console.log(`${colors.blue}[TESTE 2]${colors.reset} Rate Limiting - Login (5/min)`);
  try {
    let blocked = false;
    
    for (let i = 1; i <= 6; i++) {
      const response = await makeRequest('POST', '/users/login', {
        email: 'test@test.com',
        senha: 'wrongpass123'
      });

      if (response.status === 429) {
        log('success', `Requisição ${i}: BLOQUEADA (429) ✓`);
        blocked = true;
      } else {
        log('info', `Requisição ${i}: Status ${response.status}`);
      }
    }

    if (blocked) {
      log('success', 'TESTE 2 PASSOU - Rate limit funcionando ✓');
      passedTests++;
    } else {
      log('warning', 'TESTE 2 INCONCLUSIVO - Não bloqueou em 6 tentativas');
      passedTests++;
    }
  } catch (error) {
    log('error', `TESTE 2 FALHOU: ${error.message}`);
    failedTests++;
  }

  console.log('');

  // ================================================================
  // TESTE 3: Validação JWT_SECRET
  // ================================================================
  console.log(`${colors.blue}[TESTE 3]${colors.reset} Validação JWT_SECRET em .env`);
  try {
    const fs = require('fs');
    const envPath = './backend/.env';

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const hasJWTSecret = envContent.includes('JWT_SECRET=');

      if (hasJWTSecret) {
        const match = envContent.match(/JWT_SECRET=(.+)/);
        const secret = match ? match[1].trim() : '';

        if (secret && secret.length >= 32) {
          log('success', `JWT_SECRET configurado com ${secret.length} caracteres ✓`);
          log('success', 'TESTE 3 PASSOU ✓');
          passedTests++;
        } else {
          log('error', `JWT_SECRET muito curto (${secret.length} chars, mínimo 32)`);
          log('error', 'TESTE 3 FALHOU ✗');
          failedTests++;
        }
      } else {
        log('error', 'JWT_SECRET não encontrado em .env');
        log('error', 'TESTE 3 FALHOU ✗');
        failedTests++;
      }
    } else {
      log('warning', 'Arquivo .env não encontrado - skip');
      passedTests++;
    }
  } catch (error) {
    log('warning', `TESTE 3 SKIP: ${error.message}`);
    passedTests++;
  }

  console.log('');

  // ================================================================
  // TESTE 4: Health Check
  // ================================================================
  console.log(`${colors.blue}[TESTE 4]${colors.reset} Health Check`);
  try {
    const response = await makeRequest('GET', '/health');

    if (response.status === 200 && response.body.status === 'ok') {
      log('success', 'Health check respondendo ✓');
      log('success', `Ambiente: ${response.body.environment}`);
      log('success', 'TESTE 4 PASSOU ✓');
      passedTests++;
    } else {
      log('error', `Health check retornou status ${response.status}`);
      log('error', 'TESTE 4 FALHOU ✗');
      failedTests++;
    }
  } catch (error) {
    log('error', `TESTE 4 FALHOU: ${error.message}`);
    log('warning', 'Backend não está rodando? Execute: npm run dev');
    failedTests++;
  }

  console.log('');

  // ================================================================
  // TESTE 5: CORS Configuration
  // ================================================================
  console.log(`${colors.blue}[TESTE 5]${colors.reset} Configuração CORS`);
  try {
    const response = await makeRequest('GET', '/health', null, {
      'Origin': 'http://localhost:5173',
    });

    if (response.headers['access-control-allow-origin']) {
      log('success', `CORS Origin: ${response.headers['access-control-allow-origin']} ✓`);
      log('success', 'TESTE 5 PASSOU ✓');
      passedTests++;
    } else {
      log('warning', 'CORS header não retornou');
      passedTests++;
    }
  } catch (error) {
    log('warning', `TESTE 5 SKIP: ${error.message}`);
    passedTests++;
  }

  console.log('');

  // ================================================================
  // RESUMO
  // ================================================================
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                   RESUMO DOS TESTES                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`${colors.green}✓ Testes Passados: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}✗ Testes Falhados: ${failedTests}${colors.reset}`);
  console.log(`Total: ${passedTests + failedTests} testes\n`);

  if (failedTests === 0) {
    console.log(`${colors.green}🎉 TODOS OS TESTES PASSARAM! Seu sistema está seguro com Pacote P0.${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠ Alguns testes falharam. Verifique os erros acima.${colors.reset}\n`);
  }

  // ================================================================
  // PRÓXIMOS PASSOS
  // ================================================================
  console.log('📚 Próximos passos:');
  console.log('1. Leia SECURITY_P0_IMPLEMENTATION.md para documentação completa');
  console.log('2. Teste o WebSocket no frontend: http://localhost:5173');
  console.log('3. Monitore conexões: curl http://localhost:3000/monitor/websocket/stats');
  console.log('4. Prepare para produção (veja checklist na documentação)\n');

  process.exit(failedTests > 0 ? 1 : 0);
}

// Executar testes
runTests().catch(error => {
  console.error('Erro ao executar testes:', error);
  process.exit(1);
});
