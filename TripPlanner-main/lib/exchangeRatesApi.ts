const EXCHANGE_RATE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

interface ExchangeRatesResponse {
  base: string;
  date: string;
  rates: { [key: string]: number };
}

let cachedRates: { [key: string]: number } | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000;

export async function fetchExchangeRates(): Promise<{ [key: string]: number }> {
  const now = Date.now();
  
  if (cachedRates && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const response = await fetch(EXCHANGE_RATE_API_URL);
    
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data: ExchangeRatesResponse = await response.json();
    
    const rates: { [key: string]: number } = {
      USD: 1,
    };

    Object.entries(data.rates).forEach(([currency, rate]) => {
      rates[currency] = rate;
    });

    cachedRates = rates;
    cacheTimestamp = now;

    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    return {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.5,
      CAD: 1.35,
      AUD: 1.52,
      CHF: 0.88,
      CNY: 7.24,
      INR: 83.1,
      MXN: 17.0,
    };
  }
}

export async function getExchangeRate(fromCurrency: string, toCurrency: string = 'USD'): Promise<number> {
  if (fromCurrency === toCurrency) return 1;

  const rates = await fetchExchangeRates();
  
  if (fromCurrency === 'USD') {
    return rates[toCurrency] || 1;
  }
  
  if (toCurrency === 'USD') {
    return 1 / (rates[fromCurrency] || 1);
  }
  
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  return toRate / fromRate;
}
