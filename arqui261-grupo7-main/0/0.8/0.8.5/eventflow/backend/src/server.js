import 'dotenv/config';
import app from './app.js';
import { initializeDatabase } from './database/database.js';
import { loadExampleEvents } from './services/demoService.js';

const port = Number(process.env.PORT) || 3000;

initializeDatabase();
loadExampleEvents({ onlyIfEmpty: true });

app.listen(port, () => {
  console.log(`EventFlow API disponible en http://localhost:${port}`);
});

