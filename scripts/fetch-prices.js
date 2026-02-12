const https = require('https');
  const fs = require('fs');

  const TICKERS = ['WOW', 'CSL', 'XRO', 'WTC', 'WDS', 'MQG'];

  function fetchPrice(ticker) {
    return new Promise((resolve, reject) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}.AX?interval=1d&range=1d`;
      https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const price = json.chart?.result?.[0]?.meta?.regularMarketPrice;
            resolve({ ticker, price: price?.toFixed(2) || '--', time: new Date().toLocaleString() });
          } catch (e) { resolve({ ticker, price: '--', error: true }); }
        });
      }).on('error', () => resolve({ ticker, price: '--', error: true }));
    });
  }

  async function main() {
    const results = {};
    for (const t of TICKERS) {
      results[t] = await fetchPrice(t);
      await new Promise(r => setTimeout(r, 500));
    }
    fs.writeFileSync('prices.json', JSON.stringify(results, null, 2));
    console.log('Prices updated:', results);
  }
  main();
