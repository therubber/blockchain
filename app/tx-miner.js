

class TxMiner {
    constructor({blockchain, txPool, wallet, pubsub}) {
        this.blockchain = blockchain;
        this.txPool = txPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransactions() {
        // get the transaction pools valid transactions

        // generate the miners reward

        // add a block consisting of transactions to blockchain

        // broadcast the updated Blockchain

        // clear the txPool
    }
}

module.exports = TxMiner;