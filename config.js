const INITIAL_DIFFICULTY = 5;
const MINE_RATE = 1000;

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '-----',
    hash: 'hash-one',
    data: 'genesis-block',
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY,
};

module.exports = {GENESIS_DATA, MINE_RATE};