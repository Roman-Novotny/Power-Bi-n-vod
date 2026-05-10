const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Načtení routes
const daxRoutes      = require('./routes/dax');
const mqueryRoutes   = require('./routes/mquery');
const tutorialsRoutes = require('./routes/tutorials');
const errorsRoutes   = require('./routes/errors');

app.use('/api/dax',       daxRoutes);
app.use('/api/mquery',    mqueryRoutes);
app.use('/api/tutorials', tutorialsRoutes);
app.use('/api/errors',    errorsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Power BI Helper API běží', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Power BI Helper API běží na http://localhost:${PORT}\n`);
});
