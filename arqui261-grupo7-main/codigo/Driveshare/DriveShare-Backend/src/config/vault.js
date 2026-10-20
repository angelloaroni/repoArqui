import dotenv from 'dotenv';
import nodeVault from 'node-vault';

dotenv.config();

const vault = nodeVault({
    apiVersion: 'v1',
    endpoint: process.env.VAULT_ADDR,
    token: process.env.VAULT_TOKEN
});

export async function getRSAKeys() {

    const secret = await vault.read('secret/data/rsa');

    return {

        publicKey: secret.data.data.publicKey,

        privateKey: secret.data.data.privateKey

    };

}