const Block = require('./block');
const cryptoHash = require('../util/crypto-hash');
const {GENESIS_DATA, MINE_RATE} = require('../config')
const hexToBinary = require('hex-to-binary');

describe('Block', () => {

    const timestamp = 2000;
    const lastHash = 'foo-lastHash';
    const hash = 'foo-hash';
    let data = ['blockchain', 'data'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({timestamp, lastHash, hash, data, nonce, difficulty});


    describe('has all attributes', () => {
        it('has timestamp', () => {
            expect(block.timestamp).toEqual(timestamp);
        });

        it('has lastHash', () => {
            expect(block.lastHash).toEqual(lastHash);
        });

        it('has hash', () => {
            expect(block.hash).toEqual(hash);
        });

        it('has data', () => {
            expect(block.data).toEqual(data);
        });

        it('has nonce', () => {
            expect(block.nonce).toEqual(nonce);
        });

        it('has difficulty', () => {
            expect(block.difficulty).toEqual(difficulty);
        });
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        it('returns instance of Block', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()', () => {

        const lastBlock = Block.genesis();
        const minedBlock = Block.mineBlock({lastBlock, data});

        it('returns instance of Block', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets lastHash to hash of previous block', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets data', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets a timestamp', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('creates a SHA256 hash based on proper inputs', () => {
            expect(minedBlock.hash)
                .toEqual(
                    cryptoHash(
                        minedBlock.timestamp,
                        minedBlock.nonce,
                        minedBlock.difficulty,
                        lastBlock.hash,
                        data
                    )
                );
        });

        it('sets a hash that meets difficulty criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });

        it('adjusts the difficulty', () => {
            const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];

            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });
    });

    describe('adjustDifficulty', () => {
       it('raises the difficulty for a quickly mined block', () => {
            expect(Block.adjustDifficulty({originalBlock: block, timestamp: block.timestamp +  MINE_RATE - 100})).toEqual(block.difficulty + 1);
       });

       it('lowers the difficulty for a slowly mined block', () => {
            expect(Block.adjustDifficulty({originalBlock: block, timestamp: block.timestamp + MINE_RATE + 100})).toEqual(block.difficulty - 1);
       });

       it('has a lower limit of 1', () => {
           block.difficulty = -1;
           expect(Block.adjustDifficulty({originalBlock: block})).toEqual(1);
       });
    });
});