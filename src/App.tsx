import React, { useState, useEffect } from 'react';
import './App.css';

const POPULAR_CURRENCIES = [
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'KHR', name: 'Cambodian Riel' },
];

function App() {
  const [amount, setAmount] = useState('');
  const [convertFrom, setConvertFrom] = useState('PHP');
  const [convertTo, setConvertTo] = useState('CAD');
  const [result, setResult] = useState<number | null>(null);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['PHP', 'CAD', 'USD', 'EUR']);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  // Fetch live exchange rates from open.er-api.com API
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('https://open.er-api.com/v6/latest/PHP');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.result === 'success' && data.rates) {
          setExchangeRates(data.rates);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        setError('Unable to fetch live rates. Using fallback rates.');
        // Fallback rates with PHP as base
        const fallbackRates: { [key: string]: number } = {
          'PHP': 1,
          'CAD': 0.025,
          'USD': 0.018,
          'EUR': 0.017,
          'GBP': 0.014,
          'JPY': 2.7,
          'AUD': 0.028,
          'SGD': 0.024,
          'INR': 1.5,
          'CHF': 0.016,
          'CNY': 0.125,
          'KRW': 24,
        };
        setExchangeRates(fallbackRates);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
    // Refresh rates every 1 hour
    const interval = setInterval(fetchExchangeRate, 3600000);
    return () => clearInterval(interval);
  }, []);

  const handleConvert = () => {
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      setResult(null);
      return;
    }

    // Get exchange rates relative to PHP (base currency)
    const fromRate = exchangeRates[convertFrom] || 1;
    const toRate = exchangeRates[convertTo] || 1;
    
    // Convert: amount in convertFrom -> amount in convertTo
    const amountInPHP = numAmount / fromRate;
    const converted = amountInPHP * toRate;

    setResult(parseFloat(converted.toFixed(2)));
  };

  const handleSwapCurrency = () => {
    setConvertFrom(convertTo);
    setConvertTo(convertFrom);
    setResult(null);
  };

  const toggleFavorite = (code: string) => {
    setFavorites(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleSelectCurrency = (newCurrency: string, isFrom: boolean) => {
    if (isFrom) {
      setConvertFrom(newCurrency);
    } else {
      setConvertTo(newCurrency);
    }
    setShowCurrencySelector(false);
    setResult(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConvert();
    }
  };

  const targetCurrency = convertTo;
  const fromCurrencyName = POPULAR_CURRENCIES.find(c => c.code === convertFrom)?.name || convertFrom;
  const toCurrencyName = POPULAR_CURRENCIES.find(c => c.code === convertTo)?.name || convertTo;
  const getExchangeRate = () => {
    if (!exchangeRates[convertFrom] || !exchangeRates[convertTo]) return null;
    return (exchangeRates[convertTo] / exchangeRates[convertFrom]).toFixed(4);
  };
  
  return (
    <div className="App">
      <div className="calculator-container">
        <h1>💱 East West Converter</h1>
        <p className="subtitle">Convert between multiple currencies</p>

        {loading && <p className="loading-text">⏳ Fetching live exchange rates...</p>}
        {error && <p className="error-text">⚠️ {error}</p>}

        <div className="input-group">
          <div className="currency-section">
            <label htmlFor="amount">From</label>
            <div className="currency-selector">
              <button 
                className="currency-button"
                onClick={() => setShowCurrencySelector(!showCurrencySelector)}
                disabled={loading}
              >
                <span className="currency-code-large">{convertFrom}</span>
                <span className="currency-name">{fromCurrencyName}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
            </div>
            <div className="input-wrapper">
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setResult(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter amount"
                step="0.01"
                min="0"
                disabled={loading}
              />
            </div>
          </div>

          <button className="swap-btn" onClick={handleSwapCurrency} title="Swap currencies" disabled={loading}>
            ⇄
          </button>

          <div className="currency-section">
            <label>To</label>
            <div className="currency-selector">
              <button 
                className="currency-button"
                onClick={() => setShowCurrencySelector(!showCurrencySelector)}
                disabled={loading}
              >
                <span className="currency-code-large">{convertTo}</span>
                <span className="currency-name">{toCurrencyName}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
            </div>
            <div className="input-wrapper">
              <input
                type="text"
                value={result !== null ? result : ''}
                readOnly
                placeholder="Result will appear here"
              />
            </div>
          </div>
        </div>

        {showCurrencySelector && (
          <div className="currency-list">
            <div className="currency-list-header">
              <h3>Select Currency</h3>
              <button className="close-btn" onClick={() => setShowCurrencySelector(false)}>✕</button>
            </div>
            <div className="currency-grid">
              {POPULAR_CURRENCIES.map(currency => (
                <div key={currency.code} className="currency-item">
                  <button
                    className="currency-option"
                    onClick={() => handleSelectCurrency(currency.code, false)}
                  >
                    <div className="currency-info">
                      <strong>{currency.code}</strong>
                      <span>{currency.name}</span>
                    </div>
                  </button>
                  <button
                    className={`favorite-btn ${favorites.includes(currency.code) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(currency.code)}
                    title={favorites.includes(currency.code) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    ⭐
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="convert-btn" onClick={handleConvert} disabled={loading || Object.keys(exchangeRates).length === 0}>
          {loading ? '⏳ Loading...' : 'Convert'}
        </button>

        <div className="exchange-rate-info">
          {getExchangeRate() ? (
            <p>📊 Live Rate: 1 {convertFrom} = {getExchangeRate()} {convertTo}</p>
          ) : (
            <p>Loading exchange rate...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
