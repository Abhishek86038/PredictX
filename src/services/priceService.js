// Real price fetching from CoinGecko API

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const CRYPTOS = {
  'bitcoin': { symbol: 'BTC', id: 'bitcoin' },
  'ethereum': { symbol: 'ETH', id: 'ethereum' },
  'solana': { symbol: 'SOL', id: 'solana' },
  'cardano': { symbol: 'ADA', id: 'cardano' },
};

export const getPriceData = async (cryptoId) => {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${cryptoId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
    );
    const data = await response.json();
    return data[cryptoId];
  } catch (error) {
    throw new Error(`Failed to fetch price for ${cryptoId}: ${error.message}`);
  }
};

export const getAllPrices = async () => {
  try {
    const ids = Object.values(CRYPTOS).map(c => c.id).join(',');
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch all prices: ${error.message}`);
  }
};

export const getPriceHistory = async (cryptoId, days = 7) => {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}`
    );
    const data = await response.json();
    return data.prices; // Array of [timestamp, price]
  } catch (error) {
    throw new Error(`Failed to fetch price history: ${error.message}`);
  }
};

export const getCryptos = () => CRYPTOS;
