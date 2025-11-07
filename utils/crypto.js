// File: fetchquest-server/utils/crypto.js

const crypto = require('crypto');

// Must be 32 characters (256 bits)
const ENCRYPTION_KEY = process.env.PHONE_ENCRYPTION_KEY; 
// 16 characters (128 bits)
const IV_LENGTH = 16; 
const ALGORITHM = 'aes-256-cbc';

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error("PHONE_ENCRYPTION_KEY must be 32 characters long. Please check your .env file.");
}

function encrypt(text) {
    if (text === null || typeof text === 'undefined') {
        return null;
    }
    // Create a random 16-byte initialization vector
    let iv = crypto.randomBytes(IV_LENGTH);
    // Create the cipher
    let cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    // Encrypt the text
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    // Return iv and encrypted text, combined as a hex string
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    if (text === null || typeof text === 'undefined' || text === '') {
        return null;
    }
    // Split the text into the iv and the encrypted data
    let textParts = text.split(':');
    if (textParts.length !== 2) {
        throw new Error("Invalid encrypted data format.");
    }
    
    let iv = Buffer.from(textParts[0], 'hex');
    let encryptedText = Buffer.from(textParts[1], 'hex');
    // Create the decipher
    let decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    // Decrypt the text
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    // Return the utf-8 string
    return decrypted.toString();
}

module.exports = { encrypt, decrypt };