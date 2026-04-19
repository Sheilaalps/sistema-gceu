// Validações adicionais avançadas para campos específicos

const { z } = require('zod');

/**
 * Validação de CPF (formato: XXX.XXX.XXX-XX)
 * Remove caracteres especiais e valida o checksum
 */
const validarCPF = (cpf) => {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  // Verifica tamanho
  if (cpfLimpo.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (inválido)
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  // Calcula primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo[i]) * (10 - i);
  }
  let primeiroDigito = 11 - (soma % 11);
  if (primeiroDigito > 9) primeiroDigito = 0;
  
  // Calcula segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo[i]) * (11 - i);
  }
  let segundoDigito = 11 - (soma % 11);
  if (segundoDigito > 9) segundoDigito = 0;
  
  // Valida
  return (
    parseInt(cpfLimpo[9]) === primeiroDigito &&
    parseInt(cpfLimpo[10]) === segundoDigito
  );
};

/**
 * Validação de telefone (formatos aceitos):
 * (XX) 9XXXX-XXXX
 * (XX) XXXX-XXXX
 * XX 9XXXX-XXXX
 * XX XXXX-XXXX
 */
const validarTelefone = (telefone) => {
  if (!telefone) return false;
  
  const telefoneLimpo = telefone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (com ou sem 9)
  if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) return false;
  
  // Verifica se começa com código de área válido (11-99)
  const codigoArea = parseInt(telefoneLimpo.substring(0, 2));
  if (codigoArea < 11 || codigoArea > 99) return false;
  
  return true;
};

/**
 * Validação de Email adicional (além de zod.string().email())
 * Verifica domínios conhecidos para spambots
 */
const validarEmailSeguro = (email) => {
  if (!email) return false;
  
  // Domínios temporários/spam conhecidos
  const domainiosProibidos = [
    'guerrillamail.com',
    'tempmail.com',
    'throwaway.email',
    'mailinator.com',
    '10minutemail.com',
    'testing.com'
  ];
  
  const dominio = email.split('@')[1]?.toLowerCase() || '';
  return !domainiosProibidos.includes(dominio);
};

/**
 * Validação de data de nascimento
 * Verifica se a pessoa tem entre 13 e 120 anos
 */
const validarDataNascimento = (dataISO) => {
  if (!dataISO) return true; // Opcional
  
  const data = new Date(dataISO);
  const hoje = new Date();
  
  // Calcula idade
  let idade = hoje.getFullYear() - data.getFullYear();
  const mes = hoje.getMonth() - data.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) {
    idade--;
  }
  
  // Pessoa deve ter entre 13 e 120 anos
  return idade >= 13 && idade <= 120;
};

/**
 * Validação de nome (sem caracteres especiais perigosos)
 */
const validarNome = (nome) => {
  if (!nome) return false;
  
  // Permite apenas letras, espaços, hífens, apóstrofos e acentos
  const regex = /^[a-záàâãéèêíïóôõöúçñ\s'-]{2,100}$/i;
  return regex.test(nome);
};

/**
 * Schemas estendidos com validações customizadas
 */
const membrosExtendidoSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .refine(validarNome, 'Nome contém caracteres inválidos'),
  
  telefone: z
    .string()
    .optional()
    .refine(
      (val) => !val || validarTelefone(val),
      'Telefone em formato inválido. Use: (XX) 9XXXX-XXXX'
    ),
  
  endereco: z
    .string()
    .max(255, 'Endereço não pode ter mais de 255 caracteres')
    .optional(),
  
  data_nascimento: z
    .string()
    .datetime()
    .optional()
    .refine(
      (val) => !val || validarDataNascimento(val),
      'Data de nascimento inválida. Pessoa deve ter entre 13 e 120 anos'
    ),
  
  cpf: z
    .string()
    .optional()
    .refine(
      (val) => !val || validarCPF(val),
      'CPF em formato inválido'
    ),
  
  status: z.enum(['ativo', 'ausente', 'visitante']).default('ativo'),
});

const usuarioCriacaoExtendidaSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .refine(validarNome, 'Nome contém caracteres inválidos'),
  
  email: z
    .string()
    .email('Email inválido')
    .refine(
      validarEmailSeguro,
      'Email de domínio temporário não permitido'
    ),
  
  senha: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  
  nivel: z.enum(['admin', 'lider', 'anfitriao']).default('lider'),
});

module.exports = {
  validarCPF,
  validarTelefone,
  validarEmailSeguro,
  validarDataNascimento,
  validarNome,
  membrosExtendidoSchema,
  usuarioCriacaoExtendidaSchema,
};
