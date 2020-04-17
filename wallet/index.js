const {STARTING_BALANCE} = require('../config');
const {ec, cryptoHash} = require('../util');
const Tx = require('./tx');

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();

        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }

    createTx({recipient, amount, chain}) {
        if (chain) {
            this.balance = Wallet.calculateBalance({chain, address: this.publicKey});
        }

        if (amount > this.balance) {
            throw new Error('Amount exceeds balance');
        }
        return new Tx({senderWallet: this, recipient, amount});
    }

    static calculateBalance({chain, address}) {
        let hasConductedTx = false;
        let outputsTotal = 0;

        for (let i = chain.length - 1; i > 0; i--) {
            const block = chain[i];

            for (let tx of block.data) {
                if (tx.input.address === address) {
                    hasConductedTx = true;
                }

                const addressOutput = tx.outputMap[address];

                if (addressOutput) {
                    outputsTotal += addressOutput;
                }
            }
            if (hasConductedTx) {
                break;
            }
        }
        return hasConductedTx ? outputsTotal : STARTING_BALANCE + outputsTotal;
    }
}

module.exports = Wallet;