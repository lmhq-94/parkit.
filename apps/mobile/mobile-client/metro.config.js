/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Optimizations for faster development
config.maxWorkers = 2;

// Persistent disk cache for faster builds
config.cacheStores = [
  new (require('metro-cache').FileStore)({
    root: path.join(__dirname, 'node_modules', '.cache', 'metro'),
  }),
];

module.exports = config;
