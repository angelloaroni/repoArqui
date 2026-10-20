import fs from 'fs';
import dotenv from 'dotenv';
import nodeVault from 'node-vault';

dotenv.config();

const vault = nodeVault({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR || 'http://vault:8200',
  token: process.env.VAULT_TOKEN || 'root'
});

async function initVault() {
  try {

    const publicKey = fs.readFileSync(
      './keys/public.pem',
      'utf8'
    );

    const privateKey = fs.readFileSync(
      './keys/private.pem',
      'utf8'
    );

    await vault.write('secret/data/rsa', {
      data: {
        publicKey,
        privateKey
      }
    });

    console.log('✅ RSA keys loaded into Vault');

  } catch (error) {

    console.error('❌ Error initializing Vault:', error);

    process.exit(1);

  }
}

initVault();