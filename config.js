const INITIAL_DIFFICULTY = 2;
const MINE_RATE = 1000;
const MINE_REWARD = 50;
const STARTING_BALANCE = 1000;

/**
 * Data to be used in the genesis Block
 */
const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '-----',
    hash: 'hash-one',
    data: 'genesis-block',
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY,
};

const REWARD_INPUT = {address: '*authorized reward*'};

module.exports = {GENESIS_DATA, MINE_RATE, STARTING_BALANCE, REWARD_INPUT, MINE_REWARD};