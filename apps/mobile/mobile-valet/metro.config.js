/* eslint-disable @typescript-eslint/no-var-requires */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Optimizations for faster development in Expo Go
config.maxWorkers = 2;

// Persistent disk cache for faster builds
config.cacheStores = [
  new (require('metro-cache').FileStore)({ // eslint-disable-line @typescript-eslint/no-var-requires
    root: path.join(__dirname, 'node_modules', '.cache', 'metro'),
  }),
];

// Reduce logging in development - custom middleware
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
