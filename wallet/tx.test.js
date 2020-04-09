const Tx = require('./tx');
const Wallet = require('./index')
const {verifySignature} = require('../util');
const {REWARD_INPUT, MINE_REWARD} = require('../config');

describe('Tx', () => {

    let tx, senderWallet, recipient, amount;

    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = 'recipient-public-key';
        amount = 50;
        tx = new Tx({senderWallet, recipient, amount});
    });

    it('has an `ID`', () => {
        expect(tx).toHaveProperty('id');
    });

    describe('outputMap', () => {
        it('has an outputMap', () => {
            expect(tx).toHaveProperty('outputMap');
        });

        it('outputs the amount to recipient', () => {
            expect(tx.outputMap[recipient]).toEqual(amount);
        });

        it('outputs the remaining balance to `senderWallet`', () => {
            expect(tx.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });
    });

    describe('input', () => {
        it('has an input', () => {
            expect(tx).toHaveProperty('input');
        });

        it('has a timestamp in input', () => {
            expect(tx.input).toHaveProperty('timestamp');
        });

        it('sets the amount to the senderWallet balance', () => {
            expect(tx.input.amount).toEqual(senderWallet.balance);
        });

        it('sets the `address` to the `senderWallet` publicKey', () => {
            expect(tx.input.address).toEqual(senderWallet.publicKey);
        });

        it('signs the input', () => {
            expect(
                verifySignature({
                    publicKey: senderWallet.publicKey,
                    data: tx.outputMap,
                    signature: tx.input.signature
                })
            ).toBe(true);
        });
    });

    describe('validTx()', () => {

        let errorMock;

        beforeEach(() => {
            errorMock = jest.fn();

            global.console.error = errorMock;
        });

        describe('when the tx is valid', () => {
            it('returns true', () => {
                expect(Tx.validTx(tx)).toBe(true);
            });
        });

        describe('when the tx is invalid', () => {
            describe('and a tx outputMap value is invalid', () => {
                it('returns false and logs an error', () => {
                    tx.outputMap[senderWallet.publicKey] = 999999;

                    expect(Tx.validTx(tx)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the tx input signature is invalid', () => {
                it('returns false and logs an error', () => {
                    tx.input.signature = new Wallet().sign('data');

                    expect(Tx.validTx(tx)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });
    });

    describe('update()', () => {

        describe('and the amount is invalid', () => {
            it('throws an error', () => {
                expect(() => tx.update({senderWallet, recipient: 'foo', amount: 999999})).toThrow('Amount exceeds balance');
            });
        });

        describe('and the amount is valid', () => {

            let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

            beforeEach(() => {
                originalSignature = tx.input.signature;
                originalSenderOutput = tx.outputMap[senderWallet.publicKey];
                nextRecipient = 'foo-next-recipient';
                nextAmount = 50;

                tx.update({senderWallet, recipient: nextRecipient, amount: nextAmount});
            });

            it('outputs the amount to the next recipient', () => {
                expect(tx.outputMap[nextRecipient]).toEqual(nextAmount);
            });

            it('subtracts the amount from the original sender output amount', () => {
                expect(tx.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount);
            });

            it('maintains a total output that still matches input amount', () => {
                expect(Object.values(tx.outputMap).reduce((total, outputAmount) => total + outputAmount)).toEqual(tx.input.amount);
            });

            it('re-signs the tx', () => {
                expect(tx.input.signature).not.toEqual(originalSignature);
            });

            describe('and another update for the recipient', () => {
                let addedAmount;

                beforeEach(() => {
                   addedAmount = 80;
                   tx.update({senderWallet, recipient: nextRecipient, amount: addedAmount});
                });

                it('adds to the recipient amount', () => {
                   expect(tx.outputMap[nextRecipient]).toEqual(nextAmount + addedAmount);
                });

                it('subtracts the amount from original sender output amount', () => {
                   expect(tx.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - amount - addedAmount);
                });
            });
        });
    });

    describe('rewardTx', () => {
        let rewardTx, minerWallet;

        beforeEach(() => {
            minerWallet = new Wallet();
            rewardTx = Tx.rewardTx({minerWallet});
        });

        it('creates a tx with the reward input', () => {
           expect(rewardTx.input).toEqual(REWARD_INPUT);
        });

        it('creates tx for the miner with the `Mining reward`', () => {
            expect(rewardTx.outputMap[minerWallet.publicKey]).toEqual(MINE_REWARD);
        });
    });
});