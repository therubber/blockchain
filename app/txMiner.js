const Tx = require('../wallet/tx');

/**
 * Class for mining Blocks
 */
class TxMiner {

    constructor({blockchain, txPool, wallet, pubSub}) {
        this.blockchain = blockchain;
        this.txPool = txPool;
        this.wallet = wallet;
        this.pubSub = pubSub;
    }

    /**
     * Mines a new Block with all pending txs and broadcasts the new, longer chain to the network
     */
    mineTx() {
        const validTransactions = this.txPool.validTransactions();

        validTransactions.push(
            Tx.rewardTx({minerWallet: this.wallet})
        );

        this.blockchain.addBlock({data: validTransactions});

        this.txPool.clear();

        this.pubSub.broadcastChain();
    }
}

module.exports = TxMiner;