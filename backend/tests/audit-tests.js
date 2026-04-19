// Suite de Testes - Validação de Critérios de Auditoria
// Execute com: node backend/tests/audit-tests.js

const http = require('http');
const assert = require('assert');

// Configurações
const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@gceu.com';
const ADMIN_SENHA = 'senha123';
const LIDER_EMAIL = 'lider@gceu.com';
const LIDER_SENHA = 'senha123';
const ANFITRIAO_EMAIL = 'anfitriao@gceu.com';
const ANFITRIAO_SENHA = 'senha123';

// ====================================
// UTILIDADES DE TESTE
// ====================================

/**
 * Faz requisição HTTP
 */
async function fazerRequisicao(metodo, rota, corpo = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + rota);
    const opcoes = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      opcoes.headers['Authorization'] = `Bearer ${token}`;
    }

    const requisicao = http.request(opcoes, (resposta) => {
      let dados = '';

      resposta.on('data', (chunk) => {
        dados += chunk;
      });

      resposta.on('end', () => {
        try {
          const json = JSON.parse(dados);
          resolve({
            status: resposta.statusCode,
            dados: json,
            headers: resposta.headers,
          });
        } catch (error) {
          resolve({
            status: resposta.statusCode,
            dados: dados,
            headers: resposta.headers,
          });
        }
      });
    });

    requisicao.on('error', reject);

    if (corpo) {
      requisicao.write(JSON.stringify(corpo));
    }

    requisicao.end();
  });
}

/**
 * Faz login e retorna token
 */
async function fazerLogin(email, senha) {
  const resposta = await fazerRequisicao('POST', '/users/login', {
    email,
    senha,
  });

  if (resposta.status === 200 && resposta.dados.token) {
    return resposta.dados.token;
  } else {
    throw new Error(`Falha no login: ${JSON.stringify(resposta.dados)}`);
  }
}

/**
 * Imprime resultado do teste
 */
function printResultado(nome, sucesso, detalhes = '') {
  const emoji = sucesso ? '✅' : '❌';
  const status = sucesso ? 'PASSOU' : 'FALHOU';
  console.log(`${emoji} ${nome} - ${status}`);
  if (detalhes) console.log(`   → ${detalhes}`);
}

// ====================================
// TESTES DE COMUNICAÇÃO
// ====================================

async function testarComunicacao() {
  console.log('\n🔍 TESTE 1: COMUNICAÇÃO DO BACKEND');
  console.log('=====================================');

  try {
    // Teste 1.1: Health Check
    try {
      const resposta = await fazerRequisicao('GET', '/health');
      printResultado(
        'Health Check',
        resposta.status === 200,
        `Status ${resposta.status}`
      );
    } catch (error) {
      printResultado('Health Check', false, 'Erro ao acessar /health');
    }

    // Teste 1.2: Rotas de membros existem
    const tokenAdmin = await fazerLogin(ADMIN_EMAIL, ADMIN_SENHA);
    
    const rotas = [
      ['GET', '/membros'],
      ['GET', '/membros/1'],
      ['POST', '/membros', { nome: 'Teste' }],
      ['PUT', '/membros/1', { nome: 'Atualizado' }],
      ['DELETE', '/membros/1'],
      ['GET', '/membros/status/ativo'],
    ];

    for (const [metodo, rota, corpo] of rotas) {
      try {
        const resposta = await fazerRequisicao(metodo, rota, corpo, tokenAdmin);
        // Qualquer status que não seja erro de conexão é sucesso
        printResultado(
          `Rota ${metodo} ${rota}`,
          resposta.status !== 500,
          `Status ${resposta.status}`
        );
      } catch (error) {
        printResultado(`Rota ${metodo} ${rota}`, false, error.message);
      }
    }

    // Teste 1.3: Formatos de resposta
    const resposta = await fazerRequisicao('GET', '/membros', null, tokenAdmin);
    const temDados = resposta.dados.dados !== undefined;
    const temPaginacao = resposta.dados.paginacao !== undefined;
    printResultado(
      'Formato de resposta (com paginação)',
      temDados && temPaginacao,
      'Estrutura correta'
    );

  } catch (error) {
    console.error('Erro nos testes de comunicação:', error.message);
  }
}

// ====================================
// TESTES DE SEGURANÇA
// ====================================

async function testarSeguranca() {
  console.log('\n🔐 TESTE 2: SEGURANÇA');
  console.log('====================');

  try {
    // Teste 2.1: Autenticação obrigatória
    try {
      const resposta = await fazerRequisicao('GET', '/membros');
      printResultado(
        'Rejeita requisição sem token',
        resposta.status === 401,
        `Status ${resposta.status}`
      );
    } catch (error) {
      printResultado('Rejeita requisição sem token', false, error.message);
    }

    // Teste 2.2: Token inválido
    try {
      const resposta = await fazerRequisicao('GET', '/membros', null, 'token_falso');
      printResultado(
        'Rejeita token inválido',
        resposta.status === 401,
        `Status ${resposta.status}`
      );
    } catch (error) {
      printResultado('Rejeita token inválido', false, error.message);
    }

    // Teste 2.3: Headers de segurança
    try {
      const resposta = await fazerRequisicao('GET', '/membros');
      const temCSP = resposta.headers['content-security-policy'] !== undefined;
      const temHSTS = resposta.headers['strict-transport-security'] !== undefined;
      const temXFrame = resposta.headers['x-frame-options'] !== undefined;
      
      printResultado(
        'Headers de segurança (CSP, HSTS, X-Frame)',
        temCSP && temHSTS && temXFrame,
        'Headers presentes'
      );
    } catch (error) {
      printResultado('Headers de segurança', false, error.message);
    }

    // Teste 2.4: Rate limiting
    let tentativas = 0;
    let foiBloqueado = false;

    for (let i = 0; i < 10; i++) {
      try {
        const resposta = await fazerRequisicao('POST', '/users/login', {
          email: 'email@falso.com',
          senha: 'senha_falsa',
        });
        
        if (resposta.status === 429) {
          foiBloqueado = true;
          break;
        }
        tentativas++;
      } catch (error) {
        break;
      }
    }

    printResultado(
      'Rate limiting ativo',
      foiBloqueado,
      `Bloqueado após ~${tentativas} tentativas`
    );

  } catch (error) {
    console.error('Erro nos testes de segurança:', error.message);
  }
}

// ====================================
// TESTES DE VALIDAÇÃO
// ====================================

async function testarValidacao() {
  console.log('\n✔️ TESTE 3: VALIDAÇÃO DE DADOS');
  console.log('===============================');

  try {
    const tokenAdmin = await fazerLogin(ADMIN_EMAIL, ADMIN_SENHA);

    // Teste 3.1: Email obrigatório
    try {
      const resposta = await fazerRequisicao('POST', '/users/login', {
        email: '',
        senha: 'senha123',
      });
      
      printResultado(
        'Rejeita email vazio',
        resposta.status === 400,
        `Status ${resposta.status}`
      );
    } catch (error) {
      printResultado('Rejeita email vazio', false, error.message);
    }

    // Teste 3.2: Senha mínima
    try {
      const resposta = await fazerRequisicao('POST', '/users/login', {
        email: 'test@test.com',
        senha: '123',
      });
      
      printResultado(
        'Rejeita senha curta',
        resposta.status === 400 || resposta.status === 401,
        `Status ${resposta.status}`
      );
    } catch (error) {
      printResultado('Rejeita senha curta', false, error.message);
    }

    // Teste 3.3: Status válido
    try {
      const resposta = await fazerRequisicao('GET', '/membros/status/invalido', null, tokenAdmin);
      
      printResultado(
        'Rejeita status inválido',
        resposta.status === 400,
        `Status ${resposta.status}`
      );
    } catch (error) {
      printResultado('Rejeita status inválido', false, error.message);
    }

    // Teste 3.4: Nome obrigatório
    try {
      const resposta = await fazerRequisicao('POST', '/membros', {
        telefone: '(11) 99999-9999',
      }, tokenAdmin);
      
      printResultado(
        'Rejeita membro sem nome',
        resposta.status === 400,
        `Status ${resposta.status}`
      );
    } catch (error) {
      printResultado('Rejeita membro sem nome', false, error.message);
    }

  } catch (error) {
    console.error('Erro nos testes de validação:', error.message);
  }
}

// ====================================
// TESTES DE HIERARQUIA
// ====================================

async function testarHierarquia() {
  console.log('\n👥 TESTE 4: HIERARQUIA DE PERMISSÕES');
  console.log('====================================');

  try {
    const tokenAdmin = await fazerLogin(ADMIN_EMAIL, ADMIN_SENHA);
    const tokenLider = await fazerLogin(LIDER_EMAIL, LIDER_SENHA);
    const tokenAnfitriao = await fazerLogin(ANFITRIAO_EMAIL, ANFITRIAO_SENHA);

    // Teste 4.1: Admin pode deletar
    try {
      const resposta = await fazerRequisicao('DELETE', '/membros/999', null, tokenAdmin);
      // Pode ser 404 (membro não existe) ou 200, mas não 403
      const podeAcessar = resposta.status !== 403;
      printResultado(
        'Admin pode deletar membros',
        podeAcessar,
        `Status ${resposta.status}`
      );
    } catch (error) {
      printResultado('Admin pode deletar membros', false, error.message);
    }

    // Teste 4.2: Lider não pode deletar
    try {
      const resposta = await fazerRequisicao('DELETE', '/membros/999', null, tokenLider);
      printResultado(
        'Lider não pode deletar',
        resposta.status === 403,
        `Status ${resposta.status}`
      );
    } catch (error) {
      printResultado('Lider não pode deletar', false, error.message);
    }

    // Teste 4.3: Anfitriao não pode deletar
    try {
      const resposta = await fazerRequisicao('DELETE', '/membros/999', null, tokenAnfitriao);
      printResultado(
        'Anfitriao não pode deletar',
        resposta.status === 403,
        `Status ${resposta.status}`
      );
    } catch (error) {
      printResultado('Anfitriao não pode deletar', false, error.message);
    }

    // Teste 4.4: Anfitriao não pode criar
    try {
      const resposta = await fazerRequisicao('POST', '/membros', {
        nome: 'Teste',
      }, tokenAnfitriao);
      
      printResultado(
        'Anfitriao não pode criar membros',
        resposta.status === 403,
        `Status ${resposta.status}`
      );
    } catch (error) {
      printResultado('Anfitriao não pode criar membros', false, error.message);
    }

  } catch (error) {
    console.error('Erro nos testes de hierarquia:', error.message);
  }
}

// ====================================
// TESTES DE CRUD
// ====================================

async function testarCRUD() {
  console.log('\n🔄 TESTE 5: OPERAÇÕES CRUD');
  console.log('===========================');

  try {
    const tokenLider = await fazerLogin(LIDER_EMAIL, LIDER_SENHA);

    // Teste 5.1: CREATE
    let idMembro = null;
    try {
      const resposta = await fazerRequisicao('POST', '/membros', {
        nome: `Teste CRUD ${Date.now()}`,
        telefone: '(11) 99999-9999',
        status: 'ativo',
      }, tokenLider);

      idMembro = resposta.dados.id;
      printResultado(
        'CREATE - Criar membro',
        resposta.status === 201 && idMembro !== undefined,
        `ID: ${idMembro}`
      );
    } catch (error) {
      printResultado('CREATE - Criar membro', false, error.message);
    }

    if (!idMembro) return;

    // Teste 5.2: READ
    try {
      const resposta = await fazerRequisicao('GET', `/membros/${idMembro}`, null, tokenLider);
      printResultado(
        'READ - Obter membro',
        resposta.status === 200 && resposta.dados.id === idMembro,
        `Membro encontrado`
      );
    } catch (error) {
      printResultado('READ - Obter membro', false, error.message);
    }

    // Teste 5.3: UPDATE
    try {
      const resposta = await fazerRequisicao('PUT', `/membros/${idMembro}`, {
        telefone: '(11) 88888-8888',
      }, tokenLider);

      const temTelefoneAtualizado = resposta.dados.telefone === '(11) 88888-8888';
      printResultado(
        'UPDATE - Atualizar membro',
        resposta.status === 200 && temTelefoneAtualizado,
        'Telefone atualizado'
      );
    } catch (error) {
      printResultado('UPDATE - Atualizar membro', false, error.message);
    }

    // Teste 5.4: Relacionamento anfitriao_id
    try {
      const resposta = await fazerRequisicao('GET', `/membros/${idMembro}`, null, tokenLider);
      const temAnfitriao = resposta.dados.anfitriao_id !== null && resposta.dados.anfitriao !== undefined;
      printResultado(
        'Relacionamento - anfitriao_id preenchido',
        temAnfitriao,
        'Relacionamento funcionando'
      );
    } catch (error) {
      printResultado('Relacionamento - anfitriao_id preenchido', false, error.message);
    }

    // Teste 5.5: Presença registrada
    try {
      const resposta = await fazerRequisicao('POST', `/membros/${idMembro}/presenca`, {}, tokenLider);
      const temUltimaPresenca = resposta.dados.membro?.ultima_presenca !== null;
      const statusAtualizado = resposta.dados.membro?.status === 'ativo';
      
      printResultado(
        'Presença - Registrar presença',
        resposta.status === 200 && temUltimaPresenca && statusAtualizado,
        'Presença e status atualizados'
      );
    } catch (error) {
      printResultado('Presença - Registrar presença', false, error.message);
    }

    // Teste 5.6: DELETE
    try {
      const tokenAdmin = await fazerLogin(ADMIN_EMAIL, ADMIN_SENHA);
      const resposta = await fazerRequisicao('DELETE', `/membros/${idMembro}`, null, tokenAdmin);
      printResultado(
        'DELETE - Deletar membro',
        resposta.status === 200,
        'Membro deletado'
      );
    } catch (error) {
      printResultado('DELETE - Deletar membro', false, error.message);
    }

  } catch (error) {
    console.error('Erro nos testes de CRUD:', error.message);
  }
}

// ====================================
// EXECUÇÃO PRINCIPAL
// ====================================

async function executarTodosTestes() {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   SUITE DE TESTES DE AUDITORIA      ║');
  console.log('║   Backend - Pacote P0 de Segurança  ║');
  console.log('╚══════════════════════════════════════╝\n');

  try {
    await testarComunicacao();
    await testarSeguranca();
    await testarValidacao();
    await testarHierarquia();
    await testarCRUD();

    console.log('\n╔══════════════════════════════════════╗');
    console.log('║      TESTES CONCLUÍDOS ✅             ║');
    console.log('╚══════════════════════════════════════╝\n');
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  executarTodosTestes().catch(console.error);
}

module.exports = {
  fazerRequisicao,
  fazerLogin,
  testarComunicacao,
  testarSeguranca,
  testarValidacao,
  testarHierarquia,
  testarCRUD,
};
