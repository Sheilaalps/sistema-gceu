var express = require('express');
var router = express.Router();

/* GET lista oficial de membros GCEU */
router.get('/', function(req, res) {
  res.json([
    { id: 10, nome: "Sheila", cargo: "Líder" },
    { id: 11, nome: "Anfitrião Teste", cargo: "Anfitrião" }
  ]);
});

module.exports = router;