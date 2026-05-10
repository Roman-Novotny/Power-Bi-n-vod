const express = require('express');
const router = express.Router();
const errorsData = require('../data/errors.json');

router.get('/', (_req, res) => {
  res.json({ success: true, data: errorsData });
});

router.get('/:id', (req, res) => {
  const error = errorsData.find(e => e.id === req.params.id);
  if (!error) return res.status(404).json({ error: 'Chyba nenalezena.' });
  res.json({ success: true, data: error });
});

module.exports = router;
