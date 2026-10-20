import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        project: "Synthetic Data Generator",
        version: "1.0.0",
        status: "Running"
    });
});

app.use("/api/users", userRoutes);

export default app;