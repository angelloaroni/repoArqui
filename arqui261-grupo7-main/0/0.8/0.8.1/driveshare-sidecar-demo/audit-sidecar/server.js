//Segundo Tema Individual\driveshare-sidecar-demo\audit-sidecar\server.js
import express from "express";

import sequelize from "./config/database.js";
import auditRoutes from "./routes/audit.routes.js";

const app = express();

app.use(express.json());

app.use("/", auditRoutes);

const PORT = process.env.PORT || 4000;

const connectDatabase = async () => {

  while (true) {

    try {

      await sequelize.authenticate();

      console.log(
        "Audit Sidecar connected to PostgreSQL"
      );

      break;

    } catch (error) {

      console.log(
        "Waiting for PostgreSQL..."
      );

      await new Promise(
        resolve => setTimeout(resolve, 5000)
      );

    }

  }

};

await connectDatabase();

app.listen(PORT, () => {

  console.log(
    `Audit Sidecar running on port ${PORT}`
  );

});