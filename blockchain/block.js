const {GENESIS_DATA, MINE_RATE} = require('../config');
const {cryptoHash} = require('../util');
const hexToBinary = require('hex-to-binary');

/**
 * Class for blocks contained in the chain
 */
class Block {

    constructor({timestamp, lastHash, hash, data, nonce, difficulty}) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    /**
     * Returns a genesis block
     * @returns {Block} genesis block
     */
    static genesis() {
        return new Block(GENESIS_DATA);
    }

    /**
     * Mines a new Block
     * @param lastBlock Block to link new block to
     * @param data Data to be contained in the block
     * @returns {Block} New block with link to last block
     */
    static mineBlock({lastBlock, data}) {

        let hash, timestamp;

        const lastHash = lastBlock.hash;
        let {difficulty} = lastBlock;
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({originalBlock: lastBlock, timestamp});
            hash = cryptoHash(timestamp, lastBlock.hash, data, nonce, difficulty);
        } while (hexToBinary(hash).substring('0', difficulty) !== '0'.repeat(difficulty));

        return new Block({
            timestamp, lastHash, hash, data, nonce, difficulty
        });
    }

    /**
     * Adjusts the mining difficulty depending on the network mine rate
     * @param originalBlock OriginalBlock
     * @param timestamp Timestamp
     * @returns {number|*} Adjusted difficulty
     */
    static adjustDifficulty({originalBlock, timestamp}) {
        const {difficulty} = originalBlock;
        if (difficulty < 1) {
            return 1;
        }
        if ((timestamp - originalBlock.timestamp) > MINE_RATE) return difficulty - 1;
        return difficulty + 1;
    }
}
module.exports = Block;
