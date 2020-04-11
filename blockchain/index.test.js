const Blockchain = require('./index');
const Block = require('./block');
const {cryptoHash} = require('../util');
const Wallet = require('../wallet');
const Tx = require('../wallet/tx');

describe('Blockchain', () => {

    let blockchain, newChain, originalChain, errorMock, logMock;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;

        errorMock = jest.fn();
        logMock = jest.fn();
        global.console.error = errorMock;
        global.console.log = logMock;
    });

    it('contains a chain Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with genesis-block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new Block to the chain', () => {
        const newData = 'foo bar';
        blockchain.addBlock({data: newData});
        expect(blockchain.getLastBlock().data).toEqual(newData);
    });

    describe('isValidChain()', () => {

        beforeEach(() => {
            blockchain.addBlock({data: 'Jess T'});
            blockchain.addBlock({data: 'Jess Ts Mom'});
            blockchain.addBlock({data: 'Jess Ts Dog'});
        });

        describe('when the chain does not start with genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = {data: 'fake-genesis'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with genesis block and has multiple blocks', () => {

            describe('and a lastHash has changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'broken-lastHash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with an invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'some-bad-data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain has a jumped difficulty block', () => {

                let lastBlock, lastHash, timestamp, nonce, data, difficulty, hash, badBlock;

                beforeEach(() => {
                    lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    lastHash = lastBlock.hash;
                    timestamp = Date.now();
                    nonce = 0;
                    data = 'Jess T';
                })

                describe('difficulty jump down', () => {
                    it('returns false', () => {
                        difficulty = lastBlock.difficulty - 3;
                        hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
                        badBlock = new Block({timestamp, lastHash, hash, difficulty, nonce, data});

                        blockchain.chain.push(badBlock);
                        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                    });
                });

                describe('difficulty jumpe up', () => {
                    it('returns false', () => {
                        difficulty = lastBlock.difficulty + 3;
                        hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
                        badBlock = new Block({timestamp, lastHash, hash, difficulty, nonce, data});

                        blockchain.chain.push(badBlock);
                        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                    });
                });
            });

            describe('and the chain does not contain invalid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replaceChain()', () => {

        describe('new chain is not longer', () => {

            beforeEach(() => {
                blockchain.replaceChain(newChain.chain);
            });

            it('does not replace chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('new chain is longer', () => {

            beforeEach(() => {
                newChain.addBlock({data: 'data-to-make-newChain-longer'});
                newChain.addBlock({data: 'data-to-make-newChain-longer'});
            });

            describe('new chain is invalid', () => {

                beforeEach(() => {
                    newChain.chain[1].hash = 'schnitzel';
                    blockchain.replaceChain(newChain.chain);
                });

                it('does not replace chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('new chain is valid', () => {

                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                it('replaces chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('logs replacement of chain', () => {
                    expect(logMock).toHaveBeenCalled();
                })
            });
        });

        describe('and the `validateTx` flag is true', () => {
            it('calls validTxData()', () => {
                const txDataValidMock = jest.fn();

                blockchain.txDataValid = txDataValidMock;
                newChain.addBlock({data: 'foo'});
                blockchain.replaceChain(newChain.chain, true);
                expect(txDataValidMock).toHaveBeenCalled();
            });
        });
    });

    describe('validTxData()', () => {
        let wallet, tx, rewardTx;

        beforeEach(() => {
            wallet = new Wallet();
            tx = wallet.createTx({recipient: 'Jess T', amount: 50});
            rewardTx = Tx.rewardTx({minerWallet: wallet});
        });

        describe('when the txData is valid', () => {
            it('returns true', () => {
                newChain.addBlock({data: [tx, rewardTx]});
                expect(blockchain.txDataValid({chain: newChain.chain,})).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });

        describe('when the txData is invalid', () => {
            describe('has multiple rewards', () => {
                it('returns false and logs an error', () => {
                    newChain.addBlock({data: [tx, rewardTx, rewardTx]});
                    expect(blockchain.txDataValid({chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('txData has at least one malformed outputMap', () => {
                describe('and the tx is not a rewardTx', () => {
                    it('returns false and logs an error', () => {
                        tx.outputMap[wallet.publicKey] = 999999;
                        newChain.addBlock({data: [tx, rewardTx]});
                        expect(blockchain.txDataValid({chain: newChain.chain})).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                describe('and the tx is a rewardTx', () => {
                    it('returns false and logs an error', () => {
                        rewardTx.outputMap[wallet.publicKey] = 999999;
                        newChain.addBlock({data: [tx, rewardTx]});
                        expect(blockchain.txDataValid({chain: newChain.chain})).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });
            });

            describe('and the txData has at least one malformed input', () => {
                it('returns false and logs an error', () => {
                    wallet.balance = 999999;

                    const evilOM = {
                        [wallet.publicKey]: 999899,
                        fooRecipient: 100
                    }
                    const evilTx = {
                        input: {
                            timestamp: Date.now(),
                            amount: wallet.balance,
                            address: wallet.publicKey,
                            signature: wallet.sign(evilOM)
                        },
                        outputMap: evilOM
                    }
                    newChain.addBlock({data: [evilTx, rewardTx]});

                    expect(blockchain.txDataValid({chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the block contains multiple identical txs', () => {
                it('returns false and logs an error', () => {
                    newChain.addBlock({data: [tx, tx, tx, rewardTx]});

                    expect(blockchain.txDataValid({chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            })
        });
    });
});