const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ROTA DE LOGIN
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { email: email }
    });

    if (usuario && usuario.senha === senha) { // No futuro, usaremos criptografia aqui
      // Enviamos os dados que o React vai usar para "limitar" o acesso
      res.json({
        id: usuario.id,
        nome: usuario.nome,
        nivel: usuario.nivel 
      });
    } else {
      res.status(401).json({ message: "E-mail ou senha incorretos" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

module.exports = router;
