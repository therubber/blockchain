const crypto = require('crypto');

/**
 * Creates a SHA-256 hash
 * @param inputs inputs
 * @returns {string} SHA-256 hash of inputs
 */
const cryptoHash = (...inputs) => {

    const hash = crypto.createHash('SHA256');
    hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '));
    return hash.digest('hex');
};

module.exports = cryptoHash;