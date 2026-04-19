// Sistema de Auditoria - Registra todas as operações sensíveis

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Diretório de logs
const logsDir = path.join(__dirname, '../logs');

// Criar diretório de logs se não existir
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Tipos de eventos auditados
 */
const TiposEvento = {
  // Autenticação
  LOGIN_SUCESSO: 'LOGIN_SUCESSO',
  LOGIN_FALHO: 'LOGIN_FALHO',
  LOGOUT: 'LOGOUT',
  TOKEN_GERADO: 'TOKEN_GERADO',
  TOKEN_EXPIRADO: 'TOKEN_EXPIRADO',
  
  // Usuários
  USUARIO_CRIADO: 'USUARIO_CRIADO',
  USUARIO_ATUALIZADO: 'USUARIO_ATUALIZADO',
  USUARIO_DELETADO: 'USUARIO_DELETADO',
  
  // Membros
  MEMBRO_CRIADO: 'MEMBRO_CRIADO',
  MEMBRO_ATUALIZADO: 'MEMBRO_ATUALIZADO',
  MEMBRO_DELETADO: 'MEMBRO_DELETADO',
  PRESENCA_REGISTRADA: 'PRESENCA_REGISTRADA',
  
  // Segurança
  TENTATIVA_ACESSO_NEGADO: 'TENTATIVA_ACESSO_NEGADO',
  VALIDACAO_FALHO: 'VALIDACAO_FALHO',
  ERRO_SERVIDOR: 'ERRO_SERVIDOR',
  
  // Rate Limit
  RATE_LIMIT_ATINGIDO: 'RATE_LIMIT_ATINGIDO',
};

/**
 * Níveis de severidade
 */
const Severidade = {
  INFO: 'INFO',
  AVISO: 'AVISO',
  ERRO: 'ERRO',
  CRITICO: 'CRITICO',
};

/**
 * Registra evento de auditoria
 */
async function registrarEvento(
  tipo,
  usuario_id,
  descricao,
  dados_relacionados = {},
  severidade = Severidade.INFO,
  ip_origem = 'desconhecido'
) {
  try {
    const timestamp = new Date().toISOString();
    
    const evento = {
      timestamp,
      tipo,
      usuario_id: usuario_id || null,
      descricao,
      dados_relacionados,
      severidade,
      ip_origem,
    };
    
    // Log em arquivo
    const nomeArquivo = `auditoria_${new Date().toISOString().split('T')[0]}.log`;
    const caminhoArquivo = path.join(logsDir, nomeArquivo);
    
    fs.appendFileSync(
      caminhoArquivo,
      JSON.stringify(evento) + '\n'
    );
    
    // Log em console se for crítico
    if (severidade === Severidade.CRITICO) {
      console.error(`[AUDITORIA CRÍTICA] ${tipo}: ${descricao}`);
    }
    
    // Opcionalmente, registrar em banco de dados também
    // await prisma.auditLogs.create({
    //   data: evento
    // });
    
    return true;
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
    return false;
  }
}

/**
 * Middleware para registrar acesso às rotas
 */
const middlewareAuditoria = (tipoEvento, severidade = Severidade.INFO) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Capturar resposta original
    const originalSend = res.send;
    
    res.send = function(data) {
      const duracao = Date.now() - startTime;
      
      // Registrar auditoria
      registrarEvento(
        tipoEvento,
        req.usuario?.id,
        `${req.method} ${req.originalUrl}`,
        {
          metodo: req.method,
          rota: req.originalUrl,
          status: res.statusCode,
          duracao_ms: duracao,
          user_agent: req.get('user-agent'),
        },
        res.statusCode >= 400 ? Severidade.AVISO : severidade,
        req.ip
      );
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Registra falha de autenticação
 */
async function registrarLoginFalho(email, motivo, ip_origem) {
  await registrarEvento(
    TiposEvento.LOGIN_FALHO,
    null,
    `Falha de login para ${email}: ${motivo}`,
    { email, motivo },
    Severidade.AVISO,
    ip_origem
  );
}

/**
 * Registra login bem-sucedido
 */
async function registrarLoginSucesso(usuario_id, email, ip_origem) {
  await registrarEvento(
    TiposEvento.LOGIN_SUCESSO,
    usuario_id,
    `Login bem-sucedido para ${email}`,
    { email },
    Severidade.INFO,
    ip_origem
  );
}

/**
 * Registra criação de membro
 */
async function registrarMembroCriado(usuario_id, membro_id, nome, ip_origem) {
  await registrarEvento(
    TiposEvento.MEMBRO_CRIADO,
    usuario_id,
    `Novo membro criado: ${nome}`,
    { membro_id, nome },
    Severidade.INFO,
    ip_origem
  );
}

/**
 * Registra atualização de membro
 */
async function registrarMembroAtualizado(usuario_id, membro_id, nome, campos_alterados, ip_origem) {
  await registrarEvento(
    TiposEvento.MEMBRO_ATUALIZADO,
    usuario_id,
    `Membro atualizado: ${nome}`,
    { membro_id, nome, campos_alterados },
    Severidade.INFO,
    ip_origem
  );
}

/**
 * Registra exclusão de membro
 */
async function registrarMembroDeletado(usuario_id, membro_id, nome, ip_origem) {
  await registrarEvento(
    TiposEvento.MEMBRO_DELETADO,
    usuario_id,
    `Membro deletado: ${nome}`,
    { membro_id, nome },
    Severidade.AVISO,
    ip_origem
  );
}

/**
 * Registra acesso negado
 */
async function registrarAcessoNegado(usuario_id, rota, motivo, ip_origem) {
  await registrarEvento(
    TiposEvento.TENTATIVA_ACESSO_NEGADO,
    usuario_id,
    `Acesso negado em ${rota}: ${motivo}`,
    { rota, motivo },
    Severidade.AVISO,
    ip_origem
  );
}

/**
 * Registra rate limit atingido
 */
async function registrarRateLimit(ip_origem, rota) {
  await registrarEvento(
    TiposEvento.RATE_LIMIT_ATINGIDO,
    null,
    `Rate limit atingido para ${rota}`,
    { rota },
    Severidade.AVISO,
    ip_origem
  );
}

/**
 * Registra erro servidor
 */
async function registrarErroServidor(usuario_id, rota, mensagem_erro, ip_origem) {
  await registrarEvento(
    TiposEvento.ERRO_SERVIDOR,
    usuario_id,
    `Erro no servidor em ${rota}`,
    { rota, mensagem_erro },
    Severidade.CRITICO,
    ip_origem
  );
}

/**
 * Gera relatório de auditoria
 */
async function gerarRelatorioAuditoria(dataInicio, dataFim) {
  try {
    const nomeArquivos = [];
    const data = new Date(dataInicio);
    
    while (data <= new Date(dataFim)) {
      const nomeArquivo = `auditoria_${data.toISOString().split('T')[0]}.log`;
      const caminhoArquivo = path.join(logsDir, nomeArquivo);
      
      if (fs.existsSync(caminhoArquivo)) {
        nomeArquivos.push(nomeArquivo);
      }
      
      data.setDate(data.getDate() + 1);
    }
    
    let eventos = [];
    for (const nomeArquivo of nomeArquivos) {
      const conteudo = fs.readFileSync(path.join(logsDir, nomeArquivo), 'utf-8');
      const linhas = conteudo.trim().split('\n');
      
      for (const linha of linhas) {
        if (linha.trim()) {
          eventos.push(JSON.parse(linha));
        }
      }
    }
    
    return eventos;
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return [];
  }
}

/**
 * Limpa logs antigos (mais de 30 dias)
 */
function limparLogsAntigos(diasRetencao = 30) {
  try {
    const arquivos = fs.readdirSync(logsDir);
    const agora = Date.now();
    
    for (const arquivo of arquivos) {
      const caminhoCompleto = path.join(logsDir, arquivo);
      const stats = fs.statSync(caminhoCompleto);
      const diasPassados = (agora - stats.mtimeMs) / (1000 * 60 * 60 * 24);
      
      if (diasPassados > diasRetencao) {
        fs.unlinkSync(caminhoCompleto);
        console.log(`✅ Log antigo removido: ${arquivo}`);
      }
    }
  } catch (error) {
    console.error('Erro ao limpar logs:', error);
  }
}

module.exports = {
  TiposEvento,
  Severidade,
  registrarEvento,
  middlewareAuditoria,
  registrarLoginFalho,
  registrarLoginSucesso,
  registrarMembroCriado,
  registrarMembroAtualizado,
  registrarMembroDeletado,
  registrarAcessoNegado,
  registrarRateLimit,
  registrarErroServidor,
  gerarRelatorioAuditoria,
  limparLogsAntigos,
};
