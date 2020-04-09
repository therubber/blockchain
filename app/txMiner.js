const Tx = require('../wallet/tx');

class TxMiner {
    constructor({blockchain, txPool, wallet, pubsub}) {
        this.blockchain = blockchain;
        this.txPool = txPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTx() {
        const validTransactions = this.txPool.validTransactions();

        validTransactions.push(
            Tx.rewardTx({minerWallet: this.wallet})
        );

        this.blockchain.addBlock({data: validTransactions});

        pubsub.broadcastChain();

        this.txPool.clear();
    }
}

module.exports = TxMiner;