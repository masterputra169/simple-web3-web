import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Binance WebSocket Implementation
 * 
 * Endpoints (dari dokumentasi resmi):
 * - wss://stream.binance.com:9443/ws/<streamName> (utama, mungkin diblokir)
 * - wss://stream.binance.com:443/ws/<streamName> (port alternatif)
 * - wss://data-stream.binance.vision/ws/<streamName> (market data only, mungkin tidak diblokir)
 * 
 * Stream: ethusdt@trade - Real-time trade data
 * Stream: ethusdt@miniTicker - 24hr rolling window mini ticker (update setiap 1 detik)
 */

// WebSocket endpoints untuk dicoba (urutan prioritas)
// Menggunakan @trade stream untuk real-time updates (setiap ada transaksi)
const WS_ENDPOINTS = [
  'wss://data-stream.binance.vision/ws/ethusdt@trade', // Market data only endpoint
  'wss://stream.binance.com:9443/ws/ethusdt@trade',    // Main endpoint port 9443
  'wss://stream.binance.com:443/ws/ethusdt@trade',     // Main endpoint port 443
];

// REST API fallback
const REST_APIS = [
  {
    name: 'CryptoCompare',
    url: 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD',
    parse: (data) => data.USD,
  },
  {
    name: 'CoinGecko', 
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    parse: (data) => data.ethereum?.usd,
  },
];

// Global state
let globalEthPrice = null;
let globalLastUpdate = null;
let globalListeners = new Set();
let globalIsConnected = false;
let globalWs = null;
let globalSource = 'Initializing';
let globalReconnectTimer = null;
let globalPollTimer = null;
let globalCurrentEndpoint = 0;
let globalConnectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

// Notify listeners
const notifyListeners = () => {
  globalListeners.forEach(listener => listener({
    price: globalEthPrice,
    lastUpdate: globalLastUpdate,
    isConnected: globalIsConnected,
    source: globalSource,
  }));
};

// REST API fallback
const fetchFromApi = async () => {
  for (const api of REST_APIS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(api.url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeout);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      const price = api.parse(data);
      
      if (price && !isNaN(price) && price > 0) {
        globalEthPrice = price;
        globalLastUpdate = new Date();
        globalSource = api.name;
        notifyListeners();
        return price;
      }
    } catch (err) {
      console.warn(`${api.name} failed:`, err.message);
    }
  }
  return null;
};

// Start REST polling sebagai fallback
const startPolling = () => {
  if (globalPollTimer) return;
  fetchFromApi();
  globalPollTimer = setInterval(fetchFromApi, 1500);
  console.log('📊 Fallback polling started (1.5s)');
};

const stopPolling = () => {
  if (globalPollTimer) {
    clearInterval(globalPollTimer);
    globalPollTimer = null;
  }
};

// Connect WebSocket
const connectWebSocket = (endpointIndex = 0) => {
  // Cleanup existing connection
  if (globalWs) {
    globalWs.onclose = null; // Prevent reconnect loop
    globalWs.close();
    globalWs = null;
  }
  
  if (globalReconnectTimer) {
    clearTimeout(globalReconnectTimer);
    globalReconnectTimer = null;
  }

  // Check if all endpoints tried
  if (endpointIndex >= WS_ENDPOINTS.length) {
    console.log('❌ All WebSocket endpoints failed, using REST polling');
    globalSource = 'REST Polling';
    globalIsConnected = false;
    notifyListeners();
    startPolling();
    return;
  }

  const wsUrl = WS_ENDPOINTS[endpointIndex];
  console.log(`🔄 Trying WebSocket: ${wsUrl}`);

  try {
    globalWs = new WebSocket(wsUrl);
    globalCurrentEndpoint = endpointIndex;

    // Connection timeout (5 detik)
    const connectionTimeout = setTimeout(() => {
      if (globalWs && globalWs.readyState !== WebSocket.OPEN) {
        console.log(`⏱️ Connection timeout, trying next endpoint...`);
        globalWs.close();
        connectWebSocket(endpointIndex + 1);
      }
    }, 5000);

    globalWs.onopen = () => {
      clearTimeout(connectionTimeout);
      console.log('🟢 Binance WebSocket connected!');
      globalIsConnected = true;
      globalSource = 'Binance WebSocket';
      globalConnectionAttempts = 0;
      stopPolling(); // Stop polling karena WS sudah connect
      notifyListeners();
    };

    globalWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        /**
         * trade payload (@trade stream):
         * {
         *   "e": "trade",        // Event type
         *   "E": 1672515782136,  // Event time
         *   "s": "ETHUSDT",      // Symbol
         *   "t": 12345,          // Trade ID
         *   "p": "3112.45",      // Price
         *   "q": "0.5",          // Quantity
         *   "T": 1672515782136,  // Trade time
         *   "m": true            // Is buyer market maker?
         * }
         */
        if (data.e === 'trade' && data.p) {
          const price = parseFloat(data.p);
          if (price && !isNaN(price) && price > 0) {
            globalEthPrice = price;
            globalLastUpdate = new Date();
            notifyListeners();
          }
        }
        
        /**
         * miniTicker payload (fallback jika pakai @miniTicker):
         * {
         *   "e": "24hrMiniTicker",
         *   "c": "1234.56",  // Close price (current price)
         * }
         */
        if (data.e === '24hrMiniTicker' && data.c) {
          const price = parseFloat(data.c);
          if (price && !isNaN(price) && price > 0) {
            globalEthPrice = price;
            globalLastUpdate = new Date();
            notifyListeners();
          }
        }
      } catch (err) {
        // Ignore parse errors
      }
    };

    globalWs.onerror = (error) => {
      clearTimeout(connectionTimeout);
      console.warn(`WebSocket error on endpoint ${endpointIndex}`);
    };

    globalWs.onclose = (event) => {
      clearTimeout(connectionTimeout);
      console.log(`🔴 WebSocket closed (code: ${event.code})`);
      globalWs = null;
      
      // Jika baru pertama disconnect, coba endpoint berikutnya
      if (globalConnectionAttempts < MAX_RECONNECT_ATTEMPTS) {
        globalConnectionAttempts++;
        globalIsConnected = false;
        globalSource = 'Reconnecting...';
        notifyListeners();
        
        // Coba endpoint berikutnya setelah delay
        globalReconnectTimer = setTimeout(() => {
          connectWebSocket((endpointIndex + 1) % WS_ENDPOINTS.length);
        }, 2000);
      } else {
        // Max attempts reached, fallback ke polling
        console.log('❌ Max reconnect attempts, falling back to polling');
        globalIsConnected = false;
        startPolling();
        notifyListeners();
      }
    };

  } catch (err) {
    console.error('WebSocket creation error:', err);
    connectWebSocket(endpointIndex + 1);
  }
};

// Initialize
const initialize = () => {
  // Fetch initial price via REST (instant)
  fetchFromApi().then(() => {
    // Then try WebSocket for real-time
    connectWebSocket(0);
  });
};

// Start on module load
initialize();

/**
 * Hook untuk ETH price
 */
const useEthPrice = () => {
  const [ethPrice, setEthPrice] = useState(globalEthPrice);
  const [isConnected, setIsConnected] = useState(globalIsConnected);
  const [lastUpdated, setLastUpdated] = useState(globalLastUpdate);
  const [source, setSource] = useState(globalSource);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const listener = ({ price, lastUpdate, isConnected: connected, source: src }) => {
      if (mountedRef.current) {
        setEthPrice(price);
        setLastUpdated(lastUpdate);
        setIsConnected(connected);
        setSource(src);
      }
    };

    globalListeners.add(listener);

    // Set initial
    setEthPrice(globalEthPrice);
    setLastUpdated(globalLastUpdate);
    setIsConnected(globalIsConnected);
    setSource(globalSource);

    return () => {
      mountedRef.current = false;
      globalListeners.delete(listener);
    };
  }, []);

  const refetch = useCallback(() => {
    globalConnectionAttempts = 0;
    stopPolling();
    if (globalWs) {
      globalWs.close();
    }
    initialize();
  }, []);

  return useMemo(() => ({
    ethPrice,
    isLoading: !ethPrice,
    isConnected,
    lastUpdated,
    source,
    refetch,
  }), [ethPrice, isConnected, lastUpdated, source, refetch]);
};

export default useEthPrice;

export const getGlobalEthPrice = () => globalEthPrice;
export const preloadEthPrice = fetchFromApi;