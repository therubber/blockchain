const Tx = require('../wallet/tx');

class TxMiner {
    constructor({blockchain, txPool, wallet, pubSub}) {
        this.blockchain = blockchain;
        this.txPool = txPool;
        this.wallet = wallet;
        this.pubSub = pubSub;
    }

    mineTx() {
        const validTransactions = this.txPool.validTransactions();

        validTransactions.push(
            Tx.rewardTx({minerWallet: this.wallet})
        );

        this.blockchain.addBlock({data: validTransactions});

        this.pubSub.broadcastChain();

        this.txPool.clear();
    }
}

module.exports = TxMiner;