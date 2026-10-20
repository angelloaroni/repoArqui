//Segundo Tema Individual\driveshare-sidecar-demo\user-service\server.js
import express from "express";

import sequelize from "./config/database.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(express.json());

app.use("/users", userRoutes);

const PORT = process.env.PORT || 3000;

const connectDatabase = async () => {

  while (true) {

    try {

      await sequelize.authenticate();

      console.log(
        "User Service connected to PostgreSQL"
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
    `User Service running on port ${PORT}`
  );

});