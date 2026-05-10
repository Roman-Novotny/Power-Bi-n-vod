const express = require('express');
const router = express.Router();
const tutorialsData = require('../data/tutorials.json');

router.get('/', (_req, res) => {
  res.json({ success: true, data: tutorialsData });
});

router.get('/:id', (req, res) => {
  const tutorial = tutorialsData.find(t => t.id === req.params.id);
  if (!tutorial) return res.status(404).json({ error: 'Návod nenalezen.' });
  res.json({ success: true, data: tutorial });
});

module.exports = router;
