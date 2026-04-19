const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const criptografarSenha = async (senha) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(senha, salt);
    return hash;
  } catch (error) {
    throw new Error('Erro ao criptografar senha');
  }
};

const compararSenha = async (senha, hash) => {
  try {
    return await bcrypt.compare(senha, hash);
  } catch (error) {
    throw new Error('Erro ao comparar senhas');
  }
};

module.exports = {
  criptografarSenha,
  compararSenha,
};
