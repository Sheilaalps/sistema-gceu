const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { gerarToken, verificarToken, verificarNivel } = require('../middleware/auth');
const { criptografarSenha, compararSenha } = require('../middleware/criptografia');
const { validar, usuarioLoginSchema, usuarioCriacaoSchema } = require('../middleware/validations');
const { loginLimiter, registroLimiter } = require('../middleware/rateLimitAuth');
const prisma = new PrismaClient();

// ================================================================
// ROTA DE LOGIN - COM RATE LIMIT SEVERO (5/min)
// ================================================================
router.post('/login', loginLimiter, validar(usuarioLoginSchema), async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { email: email }
    });

    if (!usuario) {
      // ⚠️ SEGURANÇA P0: Não revelar se email existe ou não
      return res.status(401).json({ erro: "E-mail ou senha incorretos" });
    }

    const senhaValida = await compararSenha(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos" });
    }

    const token = gerarToken(usuario);

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      nivel: usuario.nivel,
      token: token,
      message: 'Login realizado com sucesso',
    });
  } catch (error) {
    console.error('[ERROR] Login:', error);
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

// ================================================================
// ROTA DE CRIAR NOVO USUÁRIO - COM RATE LIMIT (3/15min)
// ================================================================
router.post('/registrar', registroLimiter, validar(usuarioCriacaoSchema), verificarToken, verificarNivel('admin'), async (req, res) => {
  const { nome, email, senha, nivel } = req.body;

  try {
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({ erro: "Email já cadastrado" });
    }

    const senhaHash = await criptografarSenha(senha);

    const usuario = await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        nivel,
      }
    });

    res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      nivel: usuario.nivel,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('[ERROR] Registrar:', error);
    res.status(500).json({ erro: "Erro ao criar usuário" });
  }
});

// ROTA DE OBTER PERFIL DO USUÁRIO
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: req.usuario.id }
    });

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      nivel: usuario.nivel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar perfil" });
  }
});

module.exports = router;
