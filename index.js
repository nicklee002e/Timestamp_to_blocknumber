const express = require('express');
const Web3 = require('web3');
require('dotenv').config();

const app = express();
const PORT = 3333;

// Connect to BSC Testnet using environment variable
const web3 = new Web3(process.env.BSC_TESTNET_RPC_URL);

// Serve static files
app.use(express.static('public'));

// Function to convert date and time string to Unix timestamp
function dateTimeToUnix(date, time) {
    const dateTimeString = `${date} ${time}`;
    const dateTime = new Date(dateTimeString);
    return Math.floor(dateTime.getTime() / 1000);
}

// Endpoint to get current block number and timestamp
app.get('/api/current-block', async (req, res) => {
    try {
        const latestBlock = await web3.eth.getBlock('latest');
        res.json({
            timestamp: latestBlock.timestamp,
            blockNumber: latestBlock.number
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch the latest block information' });
    }
});

// Endpoint to calculate block number from given date and time
app.get('/api/block-number', async (req, res) => {
    const dates = req.query.dates ? req.query.dates.split(',') : [];
    const times = req.query.times ? req.query.times.split(',') : [];

    if (dates.length === 0 || times.length === 0 || dates.length !== times.length) {
        return res.status(400).json({ error: 'Invalid date or time' });
    }

    try {
        const latestBlock = await web3.eth.getBlock('latest');
        const currentTimestamp = latestBlock.timestamp;
        const currentBlockNumber = latestBlock.number;
        const averageBlockTime = 3; // Average block time in seconds for BSC

        const results = dates.map((date, index) => {
            const time = times[index];
            const targetTimestamp = dateTimeToUnix(date, time);
            const blockDifference = Math.round((targetTimestamp - currentTimestamp) / averageBlockTime);
            const targetBlockNumber = currentBlockNumber + blockDifference;
            return {
                targetBlockNumber: targetBlockNumber,
                targetTimestamp: targetTimestamp,
                date: date,
                time: time
            };
        });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate block number' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
