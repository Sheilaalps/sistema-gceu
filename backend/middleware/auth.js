const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-2024';

const gerarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      nivel: usuario.nivel,
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

const verificarNivel = (nivelRequerido) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    const niveisPermitidos = Array.isArray(nivelRequerido)
      ? nivelRequerido
      : [nivelRequerido];

    if (!niveisPermitidos.includes(req.usuario.nivel)) {
      return res.status(403).json({ erro: 'Sem permissão' });
    }

    next();
  };
};

module.exports = {
  gerarToken,
  verificarToken,
  verificarNivel,
  JWT_SECRET,
};
