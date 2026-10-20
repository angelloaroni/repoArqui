import { Router } from "express";
import userController from "../controllers/userController.js";

const router = Router();

router.post("/generate", userController.generateUsers);

router.get("/files", userController.getCsvFiles);

router.get("/download/:filename", userController.downloadCsv);

router.get("/", userController.getUsers);

router.get("/:id", userController.getUserById);

router.delete("/", userController.deleteUsers);

export default router;