const Wallet = require('./index');
const {verifySignature} = require('../util');
const Tx = require('./tx');

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
               expect(() => wallet.createTx({amount: 999999, recipient: 'foo-recipient'})).toThrow('Amount exceeds balance');
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
    });
});