const Block = require('./block');
const {cryptoHash} = require('../util');

class Blockchain {

    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({data}) {
        const newBlock = Block.mineBlock({lastBlock: this.getLastBlock(), data})
        this.chain.push(newBlock);
    }

    replaceChain(chain) {
        if (this.chain.length >= chain.length) {
            console.error('Chain has to be longer!');
            return;
        }
        if (!Blockchain.isValidChain(chain)) {
            console.error('Chain has to be valid!');
            return;
        }
        this.chain = chain;
        console.log('Chain has been replaced!');
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
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