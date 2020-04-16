const Tx = require('./tx');

class TxPool {

    constructor() {
        this.txMap = {};
    }

    clear() {
        this.txMap = {};
    }

    setTx(tx) {
        this.txMap[tx.id] = tx;
    }

    setMap(txMap) {
        this.txMap = txMap;
    }

    existingTx({inputAddress}) {
        const transactions = Object.values(this.txMap);

        return transactions.find(tx => tx.input.address === inputAddress);
    }

    validTransactions() {
        return Object.values(this.txMap).filter(tx => Tx.validTx(tx));
    }

    clearChainTx({chain}) {
        for(let i = 1; i < chain.length; i++) {
            const block = chain[i];

            for(let tx of block.data) {
                if(this.txMap[tx.id]) {
                    delete this.txMap[tx.id];
                }
            }
        }
    }
}

module.exports = TxPool;
