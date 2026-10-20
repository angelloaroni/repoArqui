import cors from 'cors';
import express from 'express';
import db from './database/database.js';
import dashboardRouter from './routes/dashboard.js';
import demoRouter from './routes/demo.js';
import eventsRouter from './routes/events.js';
import historyRouter from './routes/history.js';
import publishersRouter from './routes/publishers.js';
import { errorHandler, routeNotFound, sendSuccess } from './routes/response.js';
import subscribersRouter from './routes/subscribers.js';

const app = express();

app.disable('x-powered-by');
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  }),
);
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  const databaseStatus = db.prepare('SELECT 1 AS available').get().available;
  return sendSuccess(res, 'El servidor de EventFlow está disponible.', {
    status: 'ok',
    database: databaseStatus === 1 ? 'connected' : 'unavailable',
  });
});

app.use('/api/dashboard', dashboardRouter);
app.use('/api/publishers', publishersRouter);
app.use('/api/subscribers', subscribersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/history', historyRouter);
app.use('/api/demo', demoRouter);

app.use(routeNotFound);
app.use(errorHandler);

export default app;

