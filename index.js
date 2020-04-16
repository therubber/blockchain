const express = require('express');
const Blockchain = require('./blockchain');
const bodyParser = require('body-parser');
const PubSub = require('./app/pubsub');
const request = require('request');
const path = require('path');
const TxPool = require('./wallet/txPool');
const Wallet = require('./wallet/index');
const TxMiner = require('./app/txMiner');

const app = express();
const blockchain = new Blockchain();
const txPool = new TxPool();
const wallet = new Wallet();
const pubSub = new PubSub({blockchain, txPool});
const txMiner = new TxMiner({blockchain, txPool, wallet, pubSub});

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const {data} = req.body;
    blockchain.addBlock({data});
    pubSub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const {recipient, amount} = req.body;

    let tx = txPool.existingTx({inputAddress: wallet.publicKey});

    try {
        if (tx) {
            tx.update({senderWallet: wallet, recipient, amount});
        } else {
            tx = wallet.createTx({recipient, amount, chain: blockchain.chain});
        }
    } catch (error) {
        return res.status(400).json({type: 'error', message: error.message});
    }

    txPool.setTx(tx);

    pubSub.broadcastTx(tx);

    res.json({type: 'success', tx});
});

app.get('/api/tx-pool-map', (req, res) => {
    res.json(txPool.txMap);
});

app.post('/api/mine-tx', (req, res) => {
    txMiner.mineTx();

    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {

    const address = wallet.publicKey;
    res.json({
        address,
        balance: Wallet.calculateBalance({chain: blockchain.chain, address})
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/src/index.html'));
});


const syncWithRootState = () => {
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log('replace chain on a sync with ', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({url: `${ROOT_NODE_ADDRESS}/api/tx-pool-map`}, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootTxMap = JSON.parse(body);
            console.log('replacing txPool with ', rootTxMap);
            txPool.setMap(rootTxMap);
        }
    });
};

const walletFoo = new Wallet();
const walletBar = new Wallet();

const generateWalletTx = ({wallet, recipient, amount}) => {
    const tx = wallet.createTx({recipient, amount, chain: blockchain.chain});

    txPool.setTx(tx);
}

const walletAction = () => generateWalletTx({wallet, recipient: walletFoo.publicKey, amount: 10,});
const walletFooAction = () => generateWalletTx({wallet: walletFoo, recipient: walletBar, amount: 10});
const walletBarAction = () => generateWalletTx({wallet: walletBar, recipient: wallet.publicKey, amount: 10});

for (let i = 0; i < 10; i++) {
    if (i % 3 === 0) {
        walletAction();
        walletFooAction();
    } else if (i % 3 === 1) {
        walletAction();
        walletBarAction();
    } else {
        walletFooAction();
        walletBarAction();
    }

    txMiner.mineTx();
}

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`);
    if (PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }
});