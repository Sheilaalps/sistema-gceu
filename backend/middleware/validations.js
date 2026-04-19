const { z } = require('zod');

// Schemas de validação
const usuarioLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const usuarioCriacaoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  nivel: z.enum(['admin', 'lider', 'anfitriao']).default('lider'),
});

const membrosCriacaoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  data_nascimento: z.string().datetime().optional(),
  status: z.enum(['ativo', 'ausente', 'visitante']).default('ativo'),
});

const membrosAtualizacaoSchema = z.object({
  nome: z.string().min(3).optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  data_nascimento: z.string().datetime().optional(),
  status: z.enum(['ativo', 'ausente', 'visitante']).optional(),
});

// Middleware de validação
const validar = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: error.errors,
      });
    }
  };
};

module.exports = {
  usuarioLoginSchema,
  usuarioCriacaoSchema,
  membrosCriacaoSchema,
  membrosAtualizacaoSchema,
  validar,
};
