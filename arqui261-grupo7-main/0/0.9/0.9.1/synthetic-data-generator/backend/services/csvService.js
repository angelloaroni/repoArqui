import fs from "fs";
import path from "path";
import { createObjectCsvWriter } from "csv-writer";

const EXPORT_FOLDER = path.join(process.cwd(), "generated-files");

function createExportFolder() {

    if (!fs.existsSync(EXPORT_FOLDER)) {
        fs.mkdirSync(EXPORT_FOLDER);
    }

}

function generateFileName() {

    const now = new Date();

    const timestamp =
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        "_" +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0") +
        String(now.getSeconds()).padStart(2, "0");

    return `users_${timestamp}.csv`;

}

async function exportUsers(users) {

    createExportFolder();

    const fileName = generateFileName();

    const filePath = path.join(EXPORT_FOLDER, fileName);

    const csvWriter = createObjectCsvWriter({

        path: filePath,

        header: [

            { id: "name", title: "NAME" },
            { id: "lastname", title: "LASTNAME" },
            { id: "email", title: "EMAIL" },
            { id: "provider", title: "PROVIDER" },
            { id: "role", title: "ROLE" },
            { id: "status", title: "STATUS" },
            { id: "phone", title: "PHONE" },
            { id: "document_id", title: "DOCUMENT_ID" },
            { id: "nationality", title: "NATIONALITY" }

        ]

    });

    await csvWriter.writeRecords(users);

    return fileName;

}

function getAllCsvFiles() {

    createExportFolder();

    return fs
        .readdirSync(EXPORT_FOLDER)
        .filter(file => file.endsWith(".csv"))
        .sort()
        .reverse();

}

function getCsvPath(fileName) {

    return path.join(EXPORT_FOLDER, fileName);

}

export default {

    exportUsers,

    getAllCsvFiles,

    getCsvPath

};