const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verificarToken, verificarNivel } = require('../middleware/auth');
const { validar, membrosCriacaoSchema, membrosAtualizacaoSchema } = require('../middleware/validations');
const prisma = new PrismaClient();

// GET - Listar todos os membros (com paginação)
router.get('/', verificarToken, async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const skip = (pagina - 1) * limite;

    const membros = await prisma.membros.findMany({
      skip,
      take: limite,
      orderBy: { data_cadastro: 'desc' },
      include: {
        anfitriao: {
          select: { id: true, nome: true, email: true, nivel: true }
        }
      }
    });

    const total = await prisma.membros.count();

    res.json({
      dados: membros,
      paginacao: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao listar membros" });
  }
});

// GET - Buscar membro por ID
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const membro = await prisma.membros.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        anfitriao: {
          select: { id: true, nome: true, email: true, nivel: true }
        }
      }
    });

    if (!membro) {
      return res.status(404).json({ erro: "Membro não encontrado" });
    }

    res.json(membro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar membro" });
  }
});

// POST - Criar novo membro
router.post('/', verificarToken, verificarNivel(['admin', 'lider']), validar(membrosCriacaoSchema), async (req, res) => {
  try {
    const membro = await prisma.membros.create({
      data: {
        nome: req.body.nome,
        telefone: req.body.telefone || null,
        endereco: req.body.endereco || null,
        data_nascimento: req.body.data_nascimento ? new Date(req.body.data_nascimento) : null,
        anfitriao_id: req.usuario.id,
        status: req.body.status || 'ativo',
        data_cadastro: new Date()
      },
      include: {
        anfitriao: {
          select: { id: true, nome: true, email: true, nivel: true }
        }
      }
    });

    res.status(201).json(membro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar membro" });
  }
});

// PUT - Atualizar membro
router.put('/:id', verificarToken, verificarNivel(['admin', 'lider']), validar(membrosAtualizacaoSchema), async (req, res) => {
  try {
    const membro = await prisma.membros.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(req.body.nome && { nome: req.body.nome }),
        ...(req.body.telefone !== undefined && { telefone: req.body.telefone }),
        ...(req.body.endereco !== undefined && { endereco: req.body.endereco }),
        ...(req.body.data_nascimento && { data_nascimento: new Date(req.body.data_nascimento) }),
        ...(req.body.status && { status: req.body.status })
      },
      include: {
        anfitriao: {
          select: { id: true, nome: true, email: true, nivel: true }
        }
      }
    });

    res.json(membro);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: "Membro não encontrado" });
    }
    res.status(500).json({ erro: "Erro ao atualizar membro" });
  }
});

// DELETE - Deletar membro (admin only)
router.delete('/:id', verificarToken, verificarNivel('admin'), async (req, res) => {
  try {
    await prisma.membros.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ mensagem: "Membro deletado com sucesso" });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: "Membro não encontrado" });
    }
    res.status(500).json({ erro: "Erro ao deletar membro" });
  }
});

// POST - Registrar presença
router.post('/:id/presenca', verificarToken, verificarNivel(['admin', 'lider']), async (req, res) => {
  try {
    const membro = await prisma.membros.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ultima_presenca: new Date(),
        status: 'ativo'
      },
      include: {
        anfitriao: {
          select: { id: true, nome: true, email: true, nivel: true }
        }
      }
    });

    res.json({ mensagem: "Presença registrada", membro });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: "Membro não encontrado" });
    }
    res.status(500).json({ erro: "Erro ao registrar presença" });
  }
});

// GET - Buscar membros por status
router.get('/status/:status', verificarToken, async (req, res) => {
  try {
    const status = req.params.status;
    const statusValidos = ['ativo', 'ausente', 'visitante'];

    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: "Status inválido" });
    }

    const membros = await prisma.membros.findMany({
      where: { status },
      orderBy: { data_cadastro: 'desc' },
      include: {
        anfitriao: {
          select: { id: true, nome: true, email: true, nivel: true }
        }
      }
    });

    res.json(membros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar membros por status" });
  }
});

module.exports = router;