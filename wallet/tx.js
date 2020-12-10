const uuid = require('uuidv1');
const {verifySignature} = require('../util');
const {REWARD_INPUT, MINE_REWARD} = require('../config');

/**
 * Class for transactions
 */
class Tx {
    constructor({senderWallet, recipient, amount, outputMap, input}) {
        this.id = uuid();
        this.outputMap = outputMap || this.createOutputMap({senderWallet, recipient, amount});
        this.input = input || this.createInput({senderWallet, outputMap: this.outputMap});
    }

    createOutputMap({senderWallet, recipient, amount}) {
        const outputMap = {};

        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    }

    createInput({senderWallet, outputMap}) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        };
    }

    update({senderWallet, recipient, amount}) {
        if(amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds balance');
        }

        if(!this.outputMap[recipient]) {
            this.outputMap[recipient] = amount;
        } else {
            this.outputMap[recipient] += amount;
        }

        this.outputMap[senderWallet.publicKey] -= amount;
        this.input = this.createInput({senderWallet, outputMap: this.outputMap});
    }

    static validTx(tx) {
        const {input: {address, amount, signature}, outputMap} = tx;

        const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => total + outputAmount);

        if (amount !== outputTotal) {
            console.error(`Invalid tx from ${address}`);
            return false;
        }

        if (!verifySignature({publicKey: address, data: outputMap, signature})) {
            console.error(`Invalid signature from ${address}`);
            return false;
        }
        return true;
    }

    static rewardTx({minerWallet}) {
        return new Tx({
            input: REWARD_INPUT,
            outputMap: {[minerWallet.publicKey]: MINE_REWARD}
        });
    }
}

module.exports = Tx;