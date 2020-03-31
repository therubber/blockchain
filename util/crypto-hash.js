const crypto = require('crypto');

const cryptoHash = (...inputs) => {

    const hash = crypto.createHash('SHA256');
    hash.update(inputs.sort().join(' '));
    return hash.digest('hex');
};

module.exports = cryptoHash;