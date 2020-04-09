const TxPool = require('./txPool');
const Tx = require('./tx');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TxPool', () => {

    let txPool, tx, senderWallet;

    beforeEach(() => {
        txPool = new TxPool();
        senderWallet = new Wallet();
        tx = new Tx({senderWallet, recipient: 'Jess T', amount: 50});
    });

    describe('setTx()', () => {
        it('adds a tx', () => {
            txPool.setTx(tx);
            expect(txPool.txMap[tx.id]).toBe(tx);
        });
    });

    describe('existing tx', () => {
        it('returns an existing tx given an input address', () => {
            txPool.setTx(tx);
            expect(txPool.existingTx({inputAddress: senderWallet.publicKey})).toBe(tx);
        });
    });

    describe('valid transactions', () => {
        let validTransactions, errorMock;

        beforeEach(() => {
           validTransactions = [];
           errorMock = jest.fn();
           global.console.error = errorMock;

           for(let i = 0; i <= 10; i++) {
               tx = new Tx({
                   senderWallet,
                   recipient: 'some-recipient',
                   amount: 50
               });

               if(i % 3 === 0) {
                   tx.input.amount = 999999;
               } else if (i % 3 === 1) {
                   tx.input.signature = new Wallet().sign(tx);
               } else {
                   validTransactions.push(tx);
               }

               txPool.setTx(tx);
           }
        });

        it('returns valid transactions', () => {
           expect(txPool.validTransactions()).toStrictEqual(validTransactions);
        });

        it('logs errors for the invalid transactions', () => {
            txPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        });
    });

    describe('clear()', () => {
        it('clears transactions', () => {
            txPool.clear();
            expect(txPool.
                txMap).toEqual({});
        });
    });

    describe('clearBlockchainTransactions()', () => {
        it('clears the pool of any existing blockchain tx', () => {
            const blockchain = new Blockchain();
            const expectedTxMap = {};

            for(let i = 0; i <= 6; i++) {
                const transaction = new Wallet().createTx({
                    recipient: 'foo',
                    amount: 20,
                });

                txPool.setTx(transaction);

                if(i % 2 === 0) {
                    blockchain.addBlock({data: [transaction]});
                } else {
                    expectedTxMap[transaction.id] = transaction;
                }
            }

            txPool.clearChainTx({chain: blockchain.chain});

            expect(txPool.txMap).toEqual(expectedTxMap);
        });
    });
});