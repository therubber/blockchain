const Blockchain = require('../blockchain')

const blockchain = new Blockchain();

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average, data;

blockchain.addBlock({data: 'bufferblock'});

console.log('first block hash: ' + blockchain.chain[blockchain.chain.length - 1].hash);

const times = [];

for (let i = 0; i <= 30; i++) {
    prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;
    data = `block ${i}`;
    blockchain.addBlock({data});
    nextBlock = blockchain.chain[blockchain.chain.length - 1];
    nextTimestamp = nextBlock.timestamp
    timeDiff = nextTimestamp - prevTimestamp;
    times.push(timeDiff);
    average = times.reduce((total, num) => (total + num)) / times.length;
    console.log(`Block ${i} mined: ${timeDiff} average block time: ${average} ms. Difficulty: ${nextBlock.difficulty}`);
}




