import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [stocks, setStocks] = useState([]);
    const [numStocks, setNumStocks] = useState(5);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/stocks`);
                setStocks(response.data);
                setLoading(false);
            } catch (error) {
                setError(error.message || 'An error occurred');
                setLoading(false);
            }
        };

        const intervalId = setInterval(() => {
            fetchData();
        }, 1000);

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    const handleInputChange = (e) => {
        setNumStocks(Math.min(Math.max(1, e.target.value), 20));
    };

    return (
        <div>
            <label htmlFor="numStocks">Number of Stocks:</label>
            <input
                type="number"
                id="numStocks"
                value={numStocks}
                onChange={handleInputChange}
                min="1"
                max="20"
            />
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {!loading && !error && (
                <ul>
                    {stocks.slice(0, numStocks).map(stock => (
                        <li key={stock.symbol}>
                            {stock.symbol}: ${stock.price.toFixed(2)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default App;
