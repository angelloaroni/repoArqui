import express from "express";
import cors from "cors";
import "./config/env.js";
import apiRoutes from "./routes/apiRoutes.js";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "AegisSOAR API" });
});

app.use("/api", apiRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Ruta no encontrada." });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: "No se pudo completar la operación.",
    detail: process.env.NODE_ENV === "development" ? error.message : undefined
  });
});

export default app;
