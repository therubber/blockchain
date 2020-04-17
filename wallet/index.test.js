const Wallet = require('./index');
const Blockchain = require('../blockchain');
const {verifySignature} = require('../util');
const Tx = require('./tx');
const {STARTING_BALANCE} = require('../config');

describe('Wallet', () => {

    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {

        const data = 'foobar';

        it('verifies a signature', () => {
            expect(verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        it('does not verify an invalid signature', () => {
            expect(verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });
    });

    describe('createTx()', () => {
        describe('Amount exceeds balance', () => {
            it('throws an error as the result', () => {
                expect(() => wallet.createTx({
                    amount: 999999,
                    recipient: 'foo-recipient'
                })).toThrow('Amount exceeds balance');
            });
        });

        describe('amount is valid', () => {

            let tx, amount, recipient;

            beforeEach(() => {
                amount = 50;
                recipient = 'foo-recipient';
                tx = wallet.createTx({amount, recipient});
            });

            it('creates an instance of `Tx`', () => {
                expect(tx instanceof Tx).toBe(true);
            });

            it('matches tx input with the wallet', () => {
                expect(tx.input.address).toEqual(wallet.publicKey);
            });

            it('outputs the amount to recipient', () => {
                expect(tx.outputMap[recipient]).toEqual(amount);
            });
        });

        describe('and a chain is passed', () => {
            it('calls Wallet.calculateBalance()', () => {
                const calculateBalanceMock = jest.fn();
                const originalCalculateBalance = Wallet.calculateBalance;
                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTx({recipient: 'foo', amount: 50, chain: new Blockchain().chain});

                expect(calculateBalanceMock).toHaveBeenCalled();

                Wallet.calculateBalance = originalCalculateBalance;
            });
        });
    });

    describe('calculateBalance()', () => {
        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe('and there are no outputs for the wallet', () => {
            it('returns the `starting balance`', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })
                ).toEqual(STARTING_BALANCE);
            });
        });

        describe('and there are outputs for the wallet', () => {
            let txOne, txTwo;

            beforeEach(() => {
                txOne = new Wallet().createTx({recipient: wallet.publicKey, amount: 50});
                txTwo = new Wallet().createTx({recipient: wallet.publicKey, amount: 125});
                blockchain.addBlock({data: [txOne, txTwo]});
            });

            it('adds the sum of all outputs to wallet balance', () => {
                expect(
                    Wallet.calculateBalance({chain: blockchain.chain, address: wallet.publicKey})
                ).toEqual(
                    STARTING_BALANCE +
                    txOne.outputMap[wallet.publicKey] +
                    txTwo.outputMap[wallet.publicKey]
                );
            });

            describe('and the wallet has made a tx', () => {
                let recentTx;

                beforeEach(() => {
                    recentTx = wallet.createTx({recipient: 'foo', amount: 50, chain: blockchain.chain});
                    blockchain.addBlock({data: [recentTx]});
                });

                it('returns the output amount of recent tx', () => {
                    expect(
                        Wallet.calculateBalance({chain: blockchain.chain, address: wallet.publicKey})
                    ).toEqual(recentTx.outputMap[wallet.publicKey]);
                });

                describe('and there are outputs next to and after the recent tx', () => {
                    let sameBlockTx, nextBlockTx;

                    beforeEach(() => {
                        sameBlockTx = Tx.rewardTx({minerWallet: wallet});
                        nextBlockTx = new Wallet().createTx({
                            recipient: wallet.publicKey,
                            amount: 200,
                            chain: blockchain.chain
                        });

                        blockchain.addBlock({data: [recentTx, sameBlockTx]});
                        blockchain.addBlock({data: [nextBlockTx]});
                    });

                    it('includes the output amount in the returned balance', () => {
                        expect(
                            Wallet.calculateBalance({chain: blockchain.chain, address: wallet.publicKey})
                        ).toEqual(
                            recentTx.outputMap[wallet.publicKey] +
                            sameBlockTx.outputMap[wallet.publicKey] +
                            nextBlockTx.outputMap[wallet.publicKey]
                        );
                    });
                });
            });
        });
    });
});