const Block = require('./block');
const {cryptoHash} = require('../util');
const {REWARD_INPUT, MINE_REWARD} = require('../config');
const Transaction = require('../wallet/tx');
const Wallet = require('../wallet');

class Blockchain {

    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({data}) {
        const newBlock = Block.mineBlock({lastBlock: this.getLastBlock(), data})
        this.chain.push(newBlock);
    }

    replaceChain(chain, validateTx, onSuccess) {
        if (this.chain.length >= chain.length) {
            console.error('Chain has to be longer!');
            return;
        }
        if (!Blockchain.isValidChain(chain)) {
            console.error('Chain has to be valid!');
            return;
        }
        if (validateTx && !this.txDataValid({chain})) {
            console.error('Chain has invalid transaction data!');
            return;
        }

        if (onSuccess) {
            onSuccess();
        }

        this.chain = chain;
        console.log('Chain has been replaced!');
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    txDataValid({chain}) {
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const txSet = new Set();
            let rTxCount = 0;   // counter for the number of rewardTx per block
            for (let tx of block.data) {
                if (tx.input.address === REWARD_INPUT.address) {
                    rTxCount++;
                    if (rTxCount > 1) {
                        console.error('Miner rewards exceed limit!');
                        return false;
                    }
                    if (Object.values(tx.outputMap)[0] !== MINE_REWARD) {
                        console.error('Mine reward is invalid!');
                        return false;
                    }
                } else {
                    if (!Transaction.validTx(tx)) {
                        console.error('Invalid Tx!')
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({chain: this.chain, address: tx.input.address});

                    if(tx.input.amount !== trueBalance) {
                        console.error('Invalid input amount!');
                        return false;
                    }

                    if (txSet.has(tx)) {
                        console.error('An identical tx appears more than once in the block');
                        return false;
                    } else {
                        txSet.add(tx);
                    }
                }
            }
        }
        return true;
    }

    static isValidChain(chain) {
        return this.firstBlockValid(chain) && this.dataValid(chain) && this.difficultyValid(chain);
    }

    static firstBlockValid(chain) {
        let isValid = false;
        if (JSON.stringify(chain[0]) === JSON.stringify(Block.genesis())) {
            isValid = true;
        }
        return isValid;
    }

    static dataValid(chain) {
        for (let i = 1; i < chain.length; i++) {
            const {timestamp, lastHash, nonce, difficulty, data} = chain[i];
            if (cryptoHash(timestamp, lastHash, nonce, difficulty, data) !== chain[i].hash) {
                return false;
            }
        }
        return true;
    }

    static difficultyValid(chain) {
        let lastDifficulty, selectedDifficulty, difficultyDifference;

        for (let i = 1; i < chain.length; i++) {
            lastDifficulty = chain[i - 1].difficulty;
            selectedDifficulty = chain[i].difficulty;
            difficultyDifference = Math.abs(lastDifficulty - selectedDifficulty);
            if (difficultyDifference > 1) {
                return false;
            }
        }
        return true;
    }
}

module.exports = Blockchain;