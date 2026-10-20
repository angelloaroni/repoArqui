const fetch = require("node-fetch");

const VAULT_URL = "http://vault:8200";
const VAULT_TOKEN = "root";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForVault() {

  while (true) {

    try {

      const response =
        await fetch(`${VAULT_URL}/v1/sys/health`);

      if (response.ok) {
        console.log("Vault disponible");
        return;
      }

    } catch (error) {

      console.log("Esperando Vault...");

    }

    await sleep(3000);
  }
}

async function initVault() {

  await waitForVault();

  console.log("Registrando secreto inicial...");

  await fetch(
    `${VAULT_URL}/v1/secret/data/auth`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Token": VAULT_TOKEN
      },
      body: JSON.stringify({
        data: {
          activeKeyVersion: "v1"
        }
      })
    }
  );

  console.log("Secreto registrado correctamente");
}

initVault();