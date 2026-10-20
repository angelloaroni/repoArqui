import crypto from 'crypto';
import { getRSAKeys } from '../config/vault.js';

/**
 * Cifra un texto utilizando la llave pública RSA
 * almacenada en HashiCorp Vault.
 *
 * @param {string} text
 * @returns {Promise<string|null>}
 */
export async function encrypt(text) {

    if (!text) return null;

    const { publicKey } = await getRSAKeys();

    const encrypted = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        Buffer.from(text, 'utf8')
    );

    return encrypted.toString('base64');

}

/**
 * Descifra un texto utilizando la llave privada RSA
 * almacenada en HashiCorp Vault.
 *
 * @param {string} encryptedText
 * @returns {Promise<string|null>}
 */
export async function decrypt(encryptedText) {

    if (!encryptedText) return null;

    const { privateKey } = await getRSAKeys();

    const decrypted = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        Buffer.from(encryptedText, 'base64')
    );

    return decrypted.toString('utf8');

}


export const encryptData = encrypt;
export const decryptData = decrypt;