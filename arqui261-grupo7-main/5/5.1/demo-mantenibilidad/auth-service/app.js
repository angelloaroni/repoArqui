const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();

const VAULT_URL = "http://vault:8200";
const VAULT_TOKEN = "root";

app.use(express.static(path.join(__dirname, "public")));

app.get("/config", async (req, res) => {
  try {

    const response = await fetch(
      `${VAULT_URL}/v1/secret/data/auth`,
      {
        headers: {
          "X-Vault-Token": VAULT_TOKEN
        }
      }
    );

    const data = await response.json();

    res.json({
      activeKeyVersion:
        data.data.data.activeKeyVersion
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});

app.listen(3000, () => {
  console.log("Auth Service running on port 3000");
});