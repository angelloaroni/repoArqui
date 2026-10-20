import app from "./app.js";
import sequelize from "./config/database.js";

const PORT = process.env.PORT || 3200;

const connectDatabase = async () => {

    while (true) {

        try {

            await sequelize.authenticate();

            console.log("✅ Connected to PostgreSQL.");

            // Crea la tabla USER automáticamente si no existe
            await sequelize.sync();

            console.log("✅ Database synchronized.");

            break;

        } catch (error) {

            console.log("⏳ Waiting for PostgreSQL...");
            console.error(error.message);

            await new Promise(resolve => setTimeout(resolve, 5000));

        }

    }

};

await connectDatabase();

app.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

});