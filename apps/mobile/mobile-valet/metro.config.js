/* eslint-disable @typescript-eslint/no-var-requires */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Optimizaciones para desarrollo más rápido en Expo Go
config.maxWorkers = 2;

// Caché persistente en disco para builds más rápidos
config.cacheStores = [
  new (require('metro-cache').FileStore)({ // eslint-disable-line @typescript-eslint/no-var-requires
    root: path.join(__dirname, 'node_modules', '.cache', 'metro'),
  }),
];

// Reducir logging en desarrollo - middleware personalizado
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
