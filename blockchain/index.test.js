const Blockchain = require('./index');
const Block = require('./block');
const cryptoHash = require('../util/crypto-hash');

describe('Blockchain', () => {

    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
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

        let errorMock, logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;
        })

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
    });
});