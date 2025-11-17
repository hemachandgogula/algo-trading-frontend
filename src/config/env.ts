const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
  ENV: import.meta.env.MODE || 'development',
};

export default env;
