import express from 'express'
import axios from 'axios'
import fs from 'fs'

const app = express();
const PORT = 5000;

const stocksFile = 'stocks.json';
let stocksData = [];

// Function to fetch stocks from Polygon API
const fetchStocks = async () => {
    try{
        const apiKey = 'w_24VFIDcGH8t1udwXtrc7XNI4x3q_bx'; // Replace with your Polygon API key
    const response = await axios.get(`https://api.polygon.io/v3/reference/tickers?active=true&sort=ticker&order=asc&limit=20&apiKey=${apiKey}`);
    const stocks = response.data.results.map(stock => ({ symbol: stock.ticker, openPrice: stock.marketOpen }));
    return stocks;
    }
    catch(err){
        console.log(err.message)
    }
};



// Function to initialize stocks data and update prices periodically
// const initializeStocks = async () => {
//     try {
//         stocksData = await fetchStocks();
//         if (!stocksData || stocksData.length === 0) {
//             throw new Error('Failed to fetch stocks data');
//         }

//         stocksData.forEach(stock => {
//             stock.refreshInterval = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
//             setInterval(() => {
//                 stock.price = parseFloat(stock.openPrice) + Math.random();
//             }, stock.refreshInterval * 1000);
//         });

//         fs.writeFileSync(stocksFile, JSON.stringify(stocksData));
//     } catch (error) {
//         console.error(`Error initializing stocks: ${error.message}`);
//     }
// };

const initializeStocks = async () => {
    let retries = 0;

    const fetchDataWithRetry = async () => {
        try {
            stocksData = await fetchStocks();
            if (!stocksData || stocksData.length === 0) {
                throw new Error('Failed to fetch stocks data');
            }

            // ... rest of the code

            fs.writeFileSync(stocksFile, JSON.stringify(stocksData));
        } catch (error) {
            console.error(`Error initializing stocks: ${error.message}`);

            if (error.response && error.response.status === 429 && retries < 3) {
                // Retry with an exponential backoff
                retries++;
                const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
                console.log(`Retrying in ${waitTime / 1000} seconds...`);
                setTimeout(() => fetchDataWithRetry(), waitTime);
            } else {
                console.error('Max retries reached. Cannot fetch stocks data.');
            }
        }
    };

    fetchDataWithRetry();
};

// API to get stock prices
app.get('/api/stocks', (req, res) => {
    const data = JSON.parse(fs.readFileSync(stocksFile));
    res.json(data);
});

// Initialize stocks on server start
initializeStocks();

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
