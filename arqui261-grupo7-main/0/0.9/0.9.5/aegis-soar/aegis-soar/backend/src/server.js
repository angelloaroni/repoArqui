import "./config/env.js";
import { initializeDatabase } from "./database/init.js";

const port = Number(process.env.PORT) || 3000;

initializeDatabase();

// Las rutas preparan consultas al cargarse, por eso Express se importa
// únicamente después de crear las tablas y los Playbooks iniciales.
const { default: app } = await import("./app.js");

app.listen(port, () => {
  console.log(`AegisSOAR API disponible en http://localhost:${port}`);
});
