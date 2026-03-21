var express = require('express');
var router = express.Router();

/* RECURSO: Retorna a lista de usuários/membros do GCEU */
router.get('/', function(req, res, next) {
  // Aqui estamos enviando um JSON (o formato que APIs usam)
  res.json([
    { id: 1, nome: "Sheila", cargo: "Desenvolvedora" },
    { id: 2, nome: "Membro Teste", cargo: "anfitriao" }
  ]);
});

module.exports = router;