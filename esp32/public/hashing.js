const crypto = require('crypto');

/**
 * Generates a SHA-256 hash for the given input string.
 * @param {string} input - The string to hash.
 * @returns {string} - The resulting hash in hexadecimal format.
 */
function generateHash(input) {
    if (typeof input !== 'string') {
        throw new Error('Input must be a string');
    }
    return crypto.createHash('sha256').update(input).digest('hex');
}

// Example usage
const inputString = 'password';
const hash = generateHash(inputString);
console.log(`Input: ${inputString}`);
console.log(`Hash: ${hash}`);

module.exports = { generateHash };