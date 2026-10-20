import fs from "fs";

import fakerService from "../services/fakerService.js";
import csvService from "../services/csvService.js";
import userRepository from "../repositories/userRepository.js";

async function generateUsers(req, res) {

    try {

        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "The amount must be greater than zero."
            });
        }

        const startTime = Date.now();

        // 1. Generar usuarios sintéticos
        const users = await fakerService.generateUsers(amount);

        // 2. Guardar en PostgreSQL
        await userRepository.saveUsers(users);

        // 3. Exportar CSV
        const csvFile = await csvService.exportUsers(users);

        // 4. Obtener total de usuarios almacenados
        const totalUsers = await userRepository.getUsersCount();

        const executionTime = (
            (Date.now() - startTime) / 1000
        ).toFixed(2);

        return res.status(200).json({
            success: true,
            message: `${amount} synthetic users generated successfully.`,
            generated: amount,
            totalUsers,
            csvFile,
            executionTime: `${executionTime} seconds`,
            users
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error generating synthetic users.",
            error: error.message
        });

    }

}

async function getUsers(req, res) {

    try {

        const users = await userRepository.getAllUsers();

        return res.status(200).json(users);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error retrieving users.",
            error: error.message
        });

    }

}

async function getUserById(req, res) {

    try {

        const { id } = req.params;

        const user = await userRepository.getUserById(id);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        return res.status(200).json(user);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error retrieving user.",
            error: error.message
        });

    }

}

function getCsvFiles(req, res) {

    try {

        const files = csvService.getAllCsvFiles();

        return res.status(200).json({
            success: true,
            files
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

function downloadCsv(req, res) {

    try {

        const { filename } = req.params;

        const filePath = csvService.getCsvPath(filename);

        if (!fs.existsSync(filePath)) {

            return res.status(404).json({
                success: false,
                message: "CSV file not found."
            });

        }

        return res.download(filePath);

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

async function deleteUsers(req, res) {

    try {

        await userRepository.deleteAllUsers();

        return res.status(200).json({
            success: true,
            message: "All synthetic users have been deleted successfully."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error deleting users.",
            error: error.message
        });

    }

}

export default {

    generateUsers,

    getUsers,

    getUserById,

    getCsvFiles,

    downloadCsv,

    deleteUsers

};