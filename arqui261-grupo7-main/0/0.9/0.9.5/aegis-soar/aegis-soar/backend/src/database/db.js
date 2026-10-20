import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import "../config/env.js";

const databasePath = path.resolve(
  process.cwd(),
  process.env.DATABASE_PATH || "./data/aegis-soar.db"
);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export default db;
